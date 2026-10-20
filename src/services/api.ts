import { Article, StockMovement, InventoryDatabase, GitHubSyncConfig } from '../types/inventory';
import { INITIAL_TEST_ARTICLES, INITIAL_TEST_MOVEMENTS } from '../data/initialData';

const LOCAL_STORAGE_KEY = 'senaistock_inventory_cache';
const GITHUB_CONFIG_KEY = 'senaistock_github_config';

function getLocalCache(): InventoryDatabase {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Could not read from local storage cache:', e);
  }
  return {
    articles: INITIAL_TEST_ARTICLES,
    movements: INITIAL_TEST_MOVEMENTS,
    lastSync: new Date().toISOString(),
    syncProvider: 'local'
  };
}

function setLocalCache(data: InventoryDatabase) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Could not write to local storage cache:', e);
  }
}

export const api = {
  async getInventory(): Promise<InventoryDatabase> {
    try {
      const res = await fetch('/api/inventory');
      if (res.ok) {
        const data = await res.json();
        setLocalCache(data);
        return data;
      }
    } catch (e) {
      console.warn('Backend unavailable, using cached local data:', e);
    }
    return getLocalCache();
  },

  async createArticle(articleData: any): Promise<{ article: Article }> {
    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Falha ao cadastrar artigo');
      }
      const result = await res.json();
      return result;
    } catch (e: any) {
      // Offline fallback
      const cached = getLocalCache();
      const prefix = `${articleData.typeCode}-${articleData.groupCode}-${articleData.subgroupCode}`;
      const count = cached.articles.filter(a => a.code.startsWith(prefix)).length + 1;
      const code = `${prefix}-${String(count).padStart(4, '0')}`;
      const now = new Date().toISOString();
      const newArticle: Article = {
        id: `art-${Date.now()}`,
        code,
        name: articleData.name,
        typeCode: articleData.typeCode,
        groupCode: articleData.groupCode,
        subgroupCode: articleData.subgroupCode,
        typeName: articleData.typeName,
        groupName: articleData.groupName,
        subgroupName: articleData.subgroupName,
        description: articleData.description || '',
        technicalSpecs: articleData.technicalSpecs || '',
        unit: articleData.unit || 'UN',
        currentStock: Number(articleData.initialStock) || 0,
        minimumStock: Number(articleData.minimumStock) || 0,
        unitCost: Number(articleData.unitCost) || 0,
        location: articleData.location,
        createdAt: now,
        updatedAt: now
      };
      cached.articles.push(newArticle);
      if (newArticle.currentStock > 0) {
        cached.movements.unshift({
          id: `mov-${Date.now()}`,
          articleId: newArticle.id,
          articleCode: newArticle.code,
          articleName: newArticle.name,
          type: 'ENTRADA',
          quantity: newArticle.currentStock,
          previousStock: 0,
          resultingStock: newArticle.currentStock,
          unitCost: newArticle.unitCost,
          totalValue: newArticle.currentStock * newArticle.unitCost,
          reason: 'Carga Inicial de Saldo',
          operatorName: articleData.operatorName || 'Leonardo Silva',
          timestamp: now
        });
      }
      setLocalCache(cached);
      return { article: newArticle };
    }
  },

  async updateArticle(id: string, updateData: Partial<Article>): Promise<{ article: Article }> {
    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Falha ao atualizar artigo');
      }
      return await res.json();
    } catch (e: any) {
      const cached = getLocalCache();
      const index = cached.articles.findIndex(a => a.id === id);
      if (index !== -1) {
        cached.articles[index] = { ...cached.articles[index], ...updateData, updatedAt: new Date().toISOString() };
        setLocalCache(cached);
        return { article: cached.articles[index] };
      }
      throw e;
    }
  },

  async deleteArticle(id: string): Promise<void> {
    const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Falha ao excluir artigo');
    }
  },

  async registerMovement(movementData: any): Promise<{ movement: StockMovement; article: Article }> {
    try {
      const res = await fetch('/api/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(movementData)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Falha ao registrar movimentação');
      }
      return await res.json();
    } catch (e: any) {
      // Local fallback
      const cached = getLocalCache();
      const article = cached.articles.find(a => a.id === movementData.articleId);
      if (!article) throw new Error('Artigo não encontrado');
      
      const qty = Number(movementData.quantity);
      if (movementData.type === 'SAIDA' && qty > article.currentStock) {
        throw new Error(`Saldo insuficiente! Saldo atual é de ${article.currentStock} ${article.unit}.`);
      }
      const prev = article.currentStock;
      const resStock = movementData.type === 'SAIDA' ? prev - qty : prev + qty;
      article.currentStock = resStock;
      article.updatedAt = new Date().toISOString();

      const newMov: StockMovement = {
        id: `mov-${Date.now()}`,
        articleId: article.id,
        articleCode: article.code,
        articleName: article.name,
        type: movementData.type,
        quantity: qty,
        previousStock: prev,
        resultingStock: resStock,
        unitCost: movementData.unitCost || article.unitCost,
        totalValue: qty * (movementData.unitCost || article.unitCost),
        invoiceOrDocNumber: movementData.invoiceOrDocNumber,
        supplierOrOrigin: movementData.supplierOrOrigin,
        destinationOrSector: movementData.destinationOrSector,
        requesterName: movementData.requesterName,
        reason: movementData.reason,
        notes: movementData.notes,
        operatorName: movementData.operatorName || 'Leonardo Silva',
        timestamp: new Date().toISOString()
      };
      cached.movements.unshift(newMov);
      setLocalCache(cached);
      return { movement: newMov, article };
    }
  },

  async seedInitial(): Promise<InventoryDatabase> {
    try {
      const res = await fetch('/api/seed-initial', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setLocalCache(data.database);
        return data.database;
      }
    } catch (e) {
      console.warn('Fallback seed to local storage:', e);
    }
    const freshDb: InventoryDatabase = {
      articles: JSON.parse(JSON.stringify(INITIAL_TEST_ARTICLES)),
      movements: JSON.parse(JSON.stringify(INITIAL_TEST_MOVEMENTS)),
      lastSync: new Date().toISOString(),
      syncProvider: 'local'
    };
    setLocalCache(freshDb);
    return freshDb;
  },

  async resetEmpty(): Promise<InventoryDatabase> {
    try {
      const res = await fetch('/api/reset-empty', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setLocalCache(data.database);
        return data.database;
      }
    } catch (e) {
      console.warn('Fallback reset to local storage:', e);
    }
    const emptyDb: InventoryDatabase = {
      articles: [],
      movements: [],
      lastSync: new Date().toISOString(),
      syncProvider: 'local'
    };
    setLocalCache(emptyDb);
    return emptyDb;
  },

  async syncWithGitHub(token: string, gistId?: string, action: 'push' | 'pull' = 'push'): Promise<any> {
    const res = await fetch('/api/sync/github', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, gistId, action })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Falha ao sincronizar com GitHub');
    }
    const data = await res.json();
    if (data.database) {
      setLocalCache(data.database);
    }
    return data;
  },

  async importBackup(data: InventoryDatabase): Promise<InventoryDatabase> {
    const res = await fetch('/api/backup/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Falha ao restaurar backup');
    }
    const result = await res.json();
    setLocalCache(result.database);
    return result.database;
  },

  getGitHubConfig(): GitHubSyncConfig {
    try {
      const raw = localStorage.getItem(GITHUB_CONFIG_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { token: '', gistId: '', autoSync: false };
  },

  setGitHubConfig(config: GitHubSyncConfig) {
    try {
      localStorage.setItem(GITHUB_CONFIG_KEY, JSON.stringify(config));
    } catch (e) {}
  }
};
