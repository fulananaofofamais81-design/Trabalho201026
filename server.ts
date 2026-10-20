import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { Article, StockMovement, InventoryDatabase } from './src/types/inventory';
import { INITIAL_TEST_ARTICLES, INITIAL_TEST_MOVEMENTS } from './src/data/initialData';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'inventory_db.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadDatabase(): InventoryDatabase {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading inventory DB, falling back to initial data:', err);
  }

  // Initial seed with 10 test audited materials
  const initialDb: InventoryDatabase = {
    articles: JSON.parse(JSON.stringify(INITIAL_TEST_ARTICLES)),
    movements: JSON.parse(JSON.stringify(INITIAL_TEST_MOVEMENTS)),
    lastSync: new Date().toISOString(),
    syncProvider: 'local'
  };
  saveDatabase(initialDb);
  return initialDb;
}

function saveDatabase(db: InventoryDatabase): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist inventory DB:', err);
  }
}

let database: InventoryDatabase = loadDatabase();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Endpoints
  app.get('/api/inventory', (_req: Request, res: Response) => {
    res.json(database);
  });

  // Create new article with hierarchical automatic code generation
  app.post('/api/articles', (req: Request, res: Response) => {
    try {
      const {
        name,
        typeCode,
        groupCode,
        subgroupCode,
        typeName,
        groupName,
        subgroupName,
        description,
        technicalSpecs,
        unit,
        minimumStock,
        initialStock = 0,
        unitCost = 0,
        location,
        operatorName = 'Leonardo Silva'
      } = req.body;

      if (!name || !typeCode || !groupCode || !subgroupCode || !location) {
        return res.status(400).json({ error: 'Campos obrigatórios não preenchidos (Nome, Hierarquia e Localização).' });
      }

      // Generate next sequence number for this prefix
      const prefix = `${typeCode.toUpperCase().trim()}-${groupCode.toUpperCase().trim()}-${subgroupCode.toUpperCase().trim()}`;
      const existingInPrefix = database.articles.filter(a => a.code.startsWith(prefix));
      
      let nextNum = 1;
      existingInPrefix.forEach(a => {
        const parts = a.code.split('-');
        const num = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(num) && num >= nextNum) {
          nextNum = num + 1;
        }
      });

      // Also ensure global counter check
      let candidateCode = `${prefix}-${String(nextNum).padStart(4, '0')}`;
      while (database.articles.some(a => a.code === candidateCode)) {
        nextNum++;
        candidateCode = `${prefix}-${String(nextNum).padStart(4, '0')}`;
      }

      const now = new Date().toISOString();
      const newArticle: Article = {
        id: `art-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        code: candidateCode,
        name: name.trim(),
        typeCode,
        groupCode,
        subgroupCode,
        typeName,
        groupName,
        subgroupName,
        description: description?.trim() || '',
        technicalSpecs: technicalSpecs?.trim() || '',
        unit: unit || 'UN',
        currentStock: Number(initialStock) || 0,
        minimumStock: Number(minimumStock) || 0,
        unitCost: Number(unitCost) || 0,
        location: location.trim(),
        createdAt: now,
        updatedAt: now
      };

      database.articles.push(newArticle);

      // If initial stock > 0, log an initial INBOUND movement
      if (newArticle.currentStock > 0) {
        const initialMov: StockMovement = {
          id: `mov-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          articleId: newArticle.id,
          articleCode: newArticle.code,
          articleName: newArticle.name,
          type: 'ENTRADA',
          quantity: newArticle.currentStock,
          previousStock: 0,
          resultingStock: newArticle.currentStock,
          unitCost: newArticle.unitCost,
          totalValue: newArticle.currentStock * newArticle.unitCost,
          invoiceOrDocNumber: 'CADASTRO-INICIAL',
          supplierOrOrigin: 'Saldo Inicial de Almoxarifado / Inventário',
          reason: 'Carga ou Cadastro Inicial de Saldo em Estoque',
          notes: 'Registro gerado automaticamente durante o cadastro do artigo.',
          operatorName,
          timestamp: now
        };
        database.movements.unshift(initialMov);
      }

      database.lastSync = now;
      saveDatabase(database);

      res.status(201).json({ article: newArticle });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erro ao cadastrar artigo' });
    }
  });

  // Update article
  app.put('/api/articles/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const articleIndex = database.articles.findIndex(a => a.id === id);

    if (articleIndex === -1) {
      return res.status(404).json({ error: 'Artigo não encontrado.' });
    }

    const current = database.articles[articleIndex];
    const {
      name,
      description,
      technicalSpecs,
      unit,
      minimumStock,
      unitCost,
      location
    } = req.body;

    const updated: Article = {
      ...current,
      name: name !== undefined ? name.trim() : current.name,
      description: description !== undefined ? description.trim() : current.description,
      technicalSpecs: technicalSpecs !== undefined ? technicalSpecs.trim() : current.technicalSpecs,
      unit: unit !== undefined ? unit : current.unit,
      minimumStock: minimumStock !== undefined ? Number(minimumStock) : current.minimumStock,
      unitCost: unitCost !== undefined ? Number(unitCost) : current.unitCost,
      location: location !== undefined ? location.trim() : current.location,
      updatedAt: new Date().toISOString()
    };

    database.articles[articleIndex] = updated;
    saveDatabase(database);
    res.json({ article: updated });
  });

  // Delete article
  app.delete('/api/articles/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const article = database.articles.find(a => a.id === id);

    if (!article) {
      return res.status(404).json({ error: 'Artigo não encontrado.' });
    }

    // Check if it has movements
    const movementsCount = database.movements.filter(m => m.articleId === id).length;
    if (movementsCount > 1) {
      return res.status(400).json({
        error: `Não é possível excluir o artigo "${article.code}" pois constam ${movementsCount} movimentações registradas no histórico. Recomenda-se zerar o saldo ou arquivar.`
      });
    }

    database.articles = database.articles.filter(a => a.id !== id);
    database.movements = database.movements.filter(m => m.articleId !== id);
    saveDatabase(database);
    res.json({ success: true, message: `Artigo ${article.code} excluído com sucesso.` });
  });

  // Register movement (ENTRADA or SAIDA)
  app.post('/api/movements', (req: Request, res: Response) => {
    try {
      const {
        articleId,
        type, // 'ENTRADA' | 'SAIDA'
        quantity,
        unitCost,
        invoiceOrDocNumber,
        supplierOrOrigin,
        destinationOrSector,
        requesterName,
        reason,
        notes,
        operatorName = 'Leonardo Silva',
        timestamp = new Date().toISOString()
      } = req.body;

      if (!articleId || !type || !quantity || !reason) {
        return res.status(400).json({ error: 'Artigo, tipo, quantidade e motivo são obrigatórios.' });
      }

      const numQuantity = Number(quantity);
      if (isNaN(numQuantity) || numQuantity <= 0) {
        return res.status(400).json({ error: 'A quantidade deve ser um valor numérico positivo.' });
      }

      const article = database.articles.find(a => a.id === articleId);
      if (!article) {
        return res.status(404).json({ error: 'Artigo não encontrado no sistema.' });
      }

      const previousStock = article.currentStock;
      let resultingStock = previousStock;

      if (type === 'SAIDA') {
        // Strict validation: Prevent negative stock
        if (numQuantity > previousStock) {
          return res.status(400).json({
            error: `Operação não permitida: Saldo insuficiente em estoque! Saldo disponível atual: ${previousStock} ${article.unit}. Quantidade solicitada para baixa: ${numQuantity} ${article.unit}.`
          });
        }
        resultingStock = previousStock - numQuantity;
      } else if (type === 'ENTRADA') {
        resultingStock = previousStock + numQuantity;
        if (unitCost !== undefined && Number(unitCost) > 0) {
          article.unitCost = Number(unitCost);
        }
      } else {
        return res.status(400).json({ error: 'Tipo de movimentação inválido. Deve ser ENTRADA ou SAIDA.' });
      }

      article.currentStock = resultingStock;
      article.updatedAt = new Date().toISOString();

      const movement: StockMovement = {
        id: `mov-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        articleId: article.id,
        articleCode: article.code,
        articleName: article.name,
        type,
        quantity: numQuantity,
        previousStock,
        resultingStock,
        unitCost: unitCost !== undefined ? Number(unitCost) : article.unitCost,
        totalValue: numQuantity * (unitCost !== undefined ? Number(unitCost) : article.unitCost),
        invoiceOrDocNumber: invoiceOrDocNumber?.trim() || undefined,
        supplierOrOrigin: supplierOrOrigin?.trim() || undefined,
        destinationOrSector: destinationOrSector?.trim() || undefined,
        requesterName: requesterName?.trim() || undefined,
        reason: reason.trim(),
        notes: notes?.trim() || undefined,
        operatorName: operatorName?.trim() || 'Leonardo Silva',
        timestamp: timestamp || new Date().toISOString()
      };

      database.movements.unshift(movement);
      database.lastSync = new Date().toISOString();
      saveDatabase(database);

      res.status(201).json({ movement, article });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erro ao registrar movimentação' });
    }
  });

  // Seed with 10 test audited items
  app.post('/api/seed-initial', (_req: Request, res: Response) => {
    database = {
      articles: JSON.parse(JSON.stringify(INITIAL_TEST_ARTICLES)),
      movements: JSON.parse(JSON.stringify(INITIAL_TEST_MOVEMENTS)),
      lastSync: new Date().toISOString(),
      syncProvider: 'local'
    };
    saveDatabase(database);
    res.json({ message: '10 materiais de teste com auditoria carregados com sucesso!', database });
  });

  // Reset empty (ready for fresh registrations as requested)
  app.post('/api/reset-empty', (_req: Request, res: Response) => {
    database = {
      articles: [],
      movements: [],
      lastSync: new Date().toISOString(),
      syncProvider: 'local'
    };
    saveDatabase(database);
    res.json({ message: 'Estoque reinicializado vazio com sucesso!', database });
  });

  // Sync with GitHub Gist API
  app.post('/api/sync/github', async (req: Request, res: Response) => {
    const { token, gistId, action = 'push' } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'GitHub Personal Access Token é obrigatório.' });
    }

    try {
      const fileName = 'senaistock_inventory_backup.json';
      const filePayload = JSON.stringify(database, null, 2);

      if (action === 'pull' && gistId) {
        // Fetch from Gist
        const response = await fetch(`https://api.github.com/gists/${gistId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github+json',
            'User-Agent': 'SENAISTOCK-ERP'
          }
        });

        if (!response.ok) {
          throw new Error(`Falha ao buscar Gist: ${response.status} ${response.statusText}`);
        }

        const data: any = await response.json();
        const file = data.files[fileName] || Object.values(data.files)[0];
        if (!file || !file.content) {
          throw new Error('Arquivo de inventário não encontrado dentro deste Gist.');
        }

        const parsed = JSON.parse(file.content);
        if (Array.isArray(parsed.articles)) {
          database = parsed;
          database.lastSync = new Date().toISOString();
          database.syncProvider = 'github';
          saveDatabase(database);
          return res.json({ message: 'Dados baixados do GitHub Gist com sucesso!', database, gistId });
        } else {
          throw new Error('Conteúdo do arquivo não corresponde ao formato SENAISTOCK.');
        }
      }

      // Default: Push / Save to Gist
      if (gistId) {
        // Update existing Gist
        const response = await fetch(`https://api.github.com/gists/${gistId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github+json',
            'User-Agent': 'SENAISTOCK-ERP',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            description: `SENAISTOCK - Backup Sincronizado do Estoque SENAI-SP (${new Date().toLocaleString('pt-BR')})`,
            files: {
              [fileName]: { content: filePayload }
            }
          })
        });

        if (!response.ok) {
          throw new Error(`Erro ao atualizar Gist: ${response.status} ${response.statusText}`);
        }

        const data: any = await response.json();
        database.lastSync = new Date().toISOString();
        database.syncProvider = 'github';
        saveDatabase(database);
        return res.json({ message: 'Estoque sincronizado no GitHub Gist com sucesso!', gistUrl: data.html_url, gistId: data.id });
      } else {
        // Create new Gist
        const response = await fetch('https://api.github.com/gists', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github+json',
            'User-Agent': 'SENAISTOCK-ERP',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            description: 'SENAISTOCK - Backup Central de Estoque SENAI-SP',
            public: false,
            files: {
              [fileName]: { content: filePayload }
            }
          })
        });

        if (!response.ok) {
          throw new Error(`Erro ao criar Gist: ${response.status} ${response.statusText}`);
        }

        const data: any = await response.json();
        database.lastSync = new Date().toISOString();
        database.syncProvider = 'github';
        saveDatabase(database);
        return res.json({ message: 'Gist criado e dados sincronizados com sucesso!', gistUrl: data.html_url, gistId: data.id });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erro ao sincronizar com GitHub' });
    }
  });

  // Google Drive formatted export endpoint
  app.get('/api/sync/drive/export', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=senaistock-drive-sync-${Date.now()}.json`);
    res.send(JSON.stringify(database, null, 2));
  });

  // Import full database backup
  app.post('/api/backup/import', (req: Request, res: Response) => {
    try {
      const incoming = req.body;
      if (!incoming || !Array.isArray(incoming.articles)) {
        return res.status(400).json({ error: 'Arquivo inválido. O formato deve conter o array "articles".' });
      }

      database = {
        articles: incoming.articles,
        movements: Array.isArray(incoming.movements) ? incoming.movements : [],
        lastSync: new Date().toISOString(),
        syncProvider: incoming.syncProvider || 'local'
      };
      saveDatabase(database);
      res.json({ message: 'Backup importado e restaurado com sucesso!', database });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erro ao importar backup' });
    }
  });

  // Vite Integration in Development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SENAISTOCK server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
