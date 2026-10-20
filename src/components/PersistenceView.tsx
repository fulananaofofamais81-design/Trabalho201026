import React, { useState, useEffect } from 'react';
import { InventoryDatabase, GitHubSyncConfig } from '../types/inventory';
import { api } from '../services/api';
import { downloadJSONFile, formatDate } from '../utils/formatters';
import { 
  Cloud, 
  Github, 
  HardDrive, 
  RefreshCw, 
  Download, 
  Upload, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  ShieldAlert,
  Server
} from 'lucide-react';

interface PersistenceViewProps {
  database: InventoryDatabase;
  onRefresh: () => Promise<void>;
  onSeedInitial: () => Promise<void>;
  onResetEmpty: () => Promise<void>;
}

export const PersistenceView: React.FC<PersistenceViewProps> = ({
  database,
  onRefresh,
  onSeedInitial,
  onResetEmpty
}) => {
  const [gitHubToken, setGitHubToken] = useState('');
  const [gistId, setGistId] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ type: 'success' | 'error'; message: string; url?: string } | null>(null);

  useEffect(() => {
    const config = api.getGitHubConfig();
    if (config.token) setGitHubToken(config.token);
    if (config.gistId) setGistId(config.gistId);
  }, []);

  const handleSaveGitHubConfig = () => {
    api.setGitHubConfig({
      token: gitHubToken.trim(),
      gistId: gistId.trim(),
      autoSync: false,
      lastSyncedAt: new Date().toISOString()
    });
    setSyncStatus({ type: 'success', message: 'Credenciais locais do GitHub salvas com sucesso!' });
  };

  const handleGitHubSync = async (action: 'push' | 'pull') => {
    if (!gitHubToken.trim()) {
      setSyncStatus({ type: 'error', message: 'Por favor, insira o seu Personal Access Token do GitHub.' });
      return;
    }

    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const res = await api.syncWithGitHub(gitHubToken.trim(), gistId.trim() || undefined, action);
      if (res.gistId && !gistId) {
        setGistId(res.gistId);
        api.setGitHubConfig({ token: gitHubToken.trim(), gistId: res.gistId, autoSync: false });
      }
      setSyncStatus({ 
        type: 'success', 
        message: res.message || 'Sincronização concluída com sucesso!',
        url: res.gistUrl 
      });
      await onRefresh();
    } catch (err: any) {
      setSyncStatus({ type: 'error', message: err.message || 'Erro ao sincronizar com GitHub' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportDriveJSON = () => {
    downloadJSONFile(
      database,
      `senaistock_drive_backup_${new Date().toISOString().slice(0, 10)}.json`
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!Array.isArray(parsed.articles)) {
          throw new Error('Arquivo JSON inválido. Estrutura de artigos não identificada.');
        }
        await api.importBackup(parsed);
        await onRefresh();
        setSyncStatus({ type: 'success', message: `Backup importado com sucesso! ${parsed.articles.length} artigos carregados.` });
      } catch (err: any) {
        setSyncStatus({ type: 'error', message: err.message || 'Erro ao ler arquivo de backup' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="border-b border-neutral-200 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 text-blue-700 rounded-md">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
              Persistência de Dados & Sincronização em Nuvem
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500">
              Gerenciamento de persistência contínua entre recarregamentos via Servidor Local, Google Drive e GitHub Gist.
            </p>
          </div>
        </div>
      </div>

      {syncStatus && (
        <div className={`p-4 rounded-md text-xs border flex items-start gap-2.5 ${
          syncStatus.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {syncStatus.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className="font-semibold">{syncStatus.message}</p>
            {syncStatus.url && (
              <a 
                href={syncStatus.url} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-emerald-700 underline font-medium mt-1"
              >
                <span>Visualizar Gist publicado no GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Grid: 3 Storage Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Pillar 1: Local / Server Persistence */}
        <div className="bg-white border border-neutral-200 rounded-lg p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-neutral-900">
            <Server className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider">
              Armazenamento no Servidor
            </h3>
          </div>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Banco de dados JSON residente no servidor (<code className="font-mono text-[11px] bg-neutral-100 px-1 py-0.5 rounded">data/inventory_db.json</code>) e espelho em LocalStorage.
          </p>
          <div className="pt-2 border-t border-neutral-100 text-[11px] space-y-1 text-neutral-500">
            <div>Status: <strong className="text-emerald-700">Ativo e Gravando</strong></div>
            <div>Artigos em disco: <strong className="font-mono text-neutral-800">{database.articles.length}</strong></div>
            <div>Última alteração: <span className="font-mono">{formatDate(database.lastSync || '')}</span></div>
          </div>
        </div>

        {/* Pillar 2: Google Drive Export/Import */}
        <div className="bg-white border border-neutral-200 rounded-lg p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-neutral-900">
            <HardDrive className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider">
              Google Drive (JSON Sync)
            </h3>
          </div>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Exportação de arquivo de backup formatado para upload manual ou sincronizado no Google Drive da instituição.
          </p>
          <div className="pt-2 border-t border-neutral-100 flex flex-col gap-2">
            <button
              onClick={handleExportDriveJSON}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar Arquivo p/ Drive</span>
            </button>
            <label className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 rounded cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Restaurar do Drive</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Pillar 3: GitHub Gist Integration */}
        <div className="bg-white border border-neutral-200 rounded-lg p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-neutral-900">
            <Github className="w-4 h-4 text-neutral-900" />
            <h3 className="text-xs font-bold uppercase tracking-wider">
              GitHub Sync (Gist/Repo)
            </h3>
          </div>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Sincronização persistente com versionamento via GitHub Gist API, permitindo restore em qualquer computador.
          </p>
          <div className="pt-2 border-t border-neutral-100 text-[11px] text-neutral-500">
            {gistId ? (
              <span className="text-emerald-700 font-medium">Gist Vinculado: {gistId.slice(0, 10)}...</span>
            ) : (
              <span>Nenhum Gist configurado</span>
            )}
          </div>
        </div>

      </div>

      {/* GitHub Gist Configuration Card */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
          <Github className="w-4 h-4 text-neutral-900" />
          <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">
            Configurar Conexão com GitHub (Gist / Repositório)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              GitHub Personal Access Token (PAT)
            </label>
            <input
              type="password"
              value={gitHubToken}
              onChange={(e) => setGitHubToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              className="w-full text-xs font-mono border border-neutral-300 rounded-md p-2.5 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
            />
            <p className="text-[10px] text-neutral-400 mt-1">
              Necessário escopo <code className="font-mono">gist</code> para criar ou atualizar o arquivo de backup.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              ID do Gist (Opcional - deixe em branco para criar novo)
            </label>
            <input
              type="text"
              value={gistId}
              onChange={(e) => setGistId(e.target.value)}
              placeholder="Ex: 8f4a1b2c3d4e5f6a..."
              className="w-full text-xs font-mono border border-neutral-300 rounded-md p-2.5 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
            />
            <p className="text-[10px] text-neutral-400 mt-1">
              Identificador único do Gist existente no seu perfil GitHub.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button
            onClick={handleSaveGitHubConfig}
            className="px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded transition-colors"
          >
            Salvar Configuração Local
          </button>

          <button
            onClick={() => handleGitHubSync('push')}
            disabled={isSyncing}
            className="px-4 py-1.5 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{isSyncing ? 'Sincronizando...' : 'Enviar Estoque para GitHub (Push)'}</span>
          </button>

          {gistId && (
            <button
              onClick={() => handleGitHubSync('pull')}
              disabled={isSyncing}
              className="px-4 py-1.5 text-xs font-bold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Puxar Dados do GitHub (Pull)</span>
            </button>
          )}
        </div>
      </div>

      {/* Carga Inicial de Teste vs Iniciar Estoque Vazio */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
          <Sparkles className="w-4 h-4 text-red-600" />
          <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">
            Carga de Dados de Teste & Reinicialização de Estoque
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Card 1: 10 Materiais com Auditoria */}
          <div className="border border-neutral-200 rounded-md p-4 space-y-2 bg-neutral-50/50">
            <h4 className="text-xs font-bold text-neutral-900">
              Carga Inicial de Teste (10 Materiais com Auditoria)
            </h4>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Carrega o conjunto completo de 10 materiais técnicos reais do SENAI-SP (usinagem, caldeiraria, automação, metrologia) com descrição rica, código auto-gerado e sufixo <strong>[Auditoria: Leonardo]</strong>.
            </p>
            <div className="pt-2">
              <button
                onClick={onSeedInitial}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors shadow-xs"
              >
                Carregar 10 Materiais de Auditoria
              </button>
            </div>
          </div>

          {/* Card 2: Iniciar Estoque Vazio */}
          <div className="border border-neutral-200 rounded-md p-4 space-y-2 bg-neutral-50/50">
            <h4 className="text-xs font-bold text-neutral-900">
              Iniciar Estoque Vazio (Pronto para Novos Cadastros)
            </h4>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Atende à especificação de inicialização limpa: zera todos os artigos e movimentações do banco de dados para iniciar o almoxarifado do zero.
            </p>
            <div className="pt-2">
              <button
                onClick={onResetEmpty}
                className="px-4 py-2 text-xs font-bold text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar Todo o Estoque (Iniciar Vazio)</span>
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
