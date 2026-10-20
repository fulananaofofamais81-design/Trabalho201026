import React, { useState, useMemo } from 'react';
import { 
  Article, 
  StockMovement 
} from '../types/inventory';
import { 
  formatCurrency, 
  getStockStatus, 
  exportArticlesToCSV 
} from '../utils/formatters';
import { 
  Search, 
  Filter, 
  Download, 
  AlertTriangle, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Eye, 
  X,
  Package,
  Layers,
  DollarSign,
  TrendingUp,
  MapPin,
  CheckCircle2
} from 'lucide-react';

interface DashboardViewProps {
  articles: Article[];
  movements: StockMovement[];
  onNavigateTab: (tab: any, articleId?: string) => void;
  onSeedInitial: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  articles,
  movements,
  onNavigateTab,
  onSeedInitial
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Compute key summary figures
  const totalArticles = articles.length;
  const totalPhysicalUnits = useMemo(() => {
    return articles.reduce((sum, a) => sum + (Number(a.currentStock) || 0), 0);
  }, [articles]);

  const totalAssetValue = useMemo(() => {
    return articles.reduce((sum, a) => sum + ((Number(a.currentStock) || 0) * (Number(a.unitCost) || 0)), 0);
  }, [articles]);

  const lowStockArticles = useMemo(() => {
    return articles.filter(a => a.currentStock <= a.minimumStock);
  }, [articles]);

  // Extract distinct Types for filter dropdown
  const uniqueTypes = useMemo(() => {
    const map = new Map<string, string>();
    articles.forEach(a => {
      if (a.typeCode && a.typeName) {
        map.set(a.typeCode, a.typeName);
      }
    });
    return Array.from(map.entries()).map(([code, name]) => ({ code, name }));
  }, [articles]);

  // Filtered list
  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      if (onlyLowStock && article.currentStock > article.minimumStock) {
        return false;
      }
      if (selectedType !== 'all' && article.typeCode !== selectedType) {
        return false;
      }
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesCode = article.code.toLowerCase().includes(query);
        const matchesName = article.name.toLowerCase().includes(query);
        const matchesLoc = article.location.toLowerCase().includes(query);
        const matchesDesc = article.description.toLowerCase().includes(query);
        const matchesGroup = (article.groupName || '').toLowerCase().includes(query);
        const matchesSub = (article.subgroupName || '').toLowerCase().includes(query);
        return matchesCode || matchesName || matchesLoc || matchesDesc || matchesGroup || matchesSub;
      }
      return true;
    });
  }, [articles, searchTerm, selectedType, onlyLowStock]);

  return (
    <div className="space-y-6">
      
      {/* Page Header and Intro */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
            Posição Geral de Estoque & Inventário
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Visão consolidada em tempo real de artigos, saldos físicos, almoxarifados e pontos de ressuprimento.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportArticlesToCSV(filteredArticles)}
            disabled={filteredArticles.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-neutral-500" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={() => onNavigateTab('register')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors whitespace-nowrap shadow-xs"
          >
            <span>+ Novo Artigo</span>
          </button>
        </div>
      </div>

      {/* 5-Card Metric Overview Strip (Single elevation, tabular figures) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Card 1: Total Artigos */}
        <div className="bg-white border border-neutral-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Artigos Cadastrados</span>
            <Package className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 font-mono tabular-nums">
            {totalArticles}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Itens no catálogo
          </div>
        </div>

        {/* Card 2: Saldo Físico Total */}
        <div className="bg-white border border-neutral-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Unidades Físicas</span>
            <Layers className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 font-mono tabular-nums">
            {totalPhysicalUnits}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Saldo acumulado em depósito
          </div>
        </div>

        {/* Card 3: Valor Total do Patrimônio */}
        <div className="bg-white border border-neutral-200 rounded-lg p-4 shadow-xs col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Patrimônio Avaliado</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-700 font-mono tabular-nums truncate">
            {formatCurrency(totalAssetValue)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Valor de custo total
          </div>
        </div>

        {/* Card 4: Alertas de Estoque Mínimo */}
        <div 
          onClick={() => setOnlyLowStock(!onlyLowStock)}
          className={`border rounded-lg p-4 shadow-xs cursor-pointer transition-colors ${
            lowStockArticles.length > 0 
              ? 'bg-red-50/50 border-red-200 hover:bg-red-50' 
              : 'bg-white border-neutral-200'
          }`}
        >
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider text-red-700">Estoque Mínimo</span>
            <AlertTriangle className={`w-4 h-4 ${lowStockArticles.length > 0 ? 'text-red-600' : 'text-neutral-400'}`} />
          </div>
          <div className={`text-2xl font-bold font-mono tabular-nums ${lowStockArticles.length > 0 ? 'text-red-700' : 'text-neutral-900'}`}>
            {lowStockArticles.length}
          </div>
          <div className="text-[11px] text-neutral-600 mt-1">
            {onlyLowStock ? 'Filtro ativo (clique para limpar)' : 'Requer reposição'}
          </div>
        </div>

        {/* Card 5: Movimentações Registradas */}
        <div className="bg-white border border-neutral-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Movimentações</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 font-mono tabular-nums">
            {movements.length}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Entradas e saídas no livro
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-neutral-200 rounded-lg p-3 sm:p-4 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Live Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por código (ex: MAT-MET), nome, localização ou especificação técnica..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-neutral-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-red-600 focus:border-red-600 bg-neutral-50/50"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Type Filter Dropdown & Toggle */}
          <div className="flex items-center gap-2 overflow-x-auto">
            <div className="flex items-center gap-1.5 shrink-0 text-xs text-neutral-600">
              <Filter className="w-3.5 h-3.5 text-neutral-400" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="text-xs border border-neutral-300 rounded-md px-2.5 py-2 bg-white text-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-red-600"
              >
                <option value="all">Todos os Tipos</option>
                {uniqueTypes.map(t => (
                  <option key={t.code} value={t.code}>{t.name} ({t.code})</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setOnlyLowStock(!onlyLowStock)}
              className={`px-3 py-2 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                onlyLowStock
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Apenas Estoque Baixo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Stock Table */}
      <div className="bg-white border border-neutral-200 rounded-lg shadow-xs overflow-hidden">
        {filteredArticles.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-neutral-800">
              {articles.length === 0 ? 'Nenhum material cadastrado' : 'Nenhum artigo corresponde à busca'}
            </h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
              {articles.length === 0 
                ? 'O sistema está pronto para receber cadastros. Você pode cadastrar o primeiro artigo manualmente ou carregar a carga de 10 materiais técnicos de auditoria.'
                : 'Tente alterar os termos da busca ou desmarcar o filtro de estoque baixo.'}
            </p>
            {articles.length === 0 && (
              <div className="mt-5 flex items-center justify-center gap-3">
                <button
                  onClick={onSeedInitial}
                  className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md shadow-xs transition-colors"
                >
                  Carregar 10 Materiais de Teste (Auditoria)
                </button>
                <button
                  onClick={() => onNavigateTab('register')}
                  className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-md transition-colors"
                >
                  Cadastrar Manualmente
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-700">
              <thead className="bg-neutral-100/75 border-b border-neutral-200 text-[11px] font-semibold text-neutral-600 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-4 py-3">Código</th>
                  <th scope="col" className="px-4 py-3">Artigo & Especificação</th>
                  <th scope="col" className="px-4 py-3 hidden md:table-cell">Hierarquia (4 Níveis)</th>
                  <th scope="col" className="px-4 py-3">Localização</th>
                  <th scope="col" className="px-4 py-3 text-right">Saldo Atual</th>
                  <th scope="col" className="px-4 py-3 text-right hidden sm:table-cell">Mínimo</th>
                  <th scope="col" className="px-4 py-3 text-right hidden lg:table-cell">Custo Unit.</th>
                  <th scope="col" className="px-4 py-3 text-right hidden xl:table-cell">Valor Total</th>
                  <th scope="col" className="px-4 py-3 text-center">Status</th>
                  <th scope="col" className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/75">
                {filteredArticles.map(article => {
                  const status = getStockStatus(article.currentStock, article.minimumStock);
                  const totalValue = article.currentStock * article.unitCost;

                  return (
                    <tr 
                      key={article.id}
                      className="hover:bg-neutral-50/80 transition-colors"
                    >
                      {/* Código Auto-Gerado */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-mono font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded text-[11px] border border-neutral-200">
                          {article.code}
                        </span>
                      </td>

                      {/* Nome e Resumo */}
                      <td className="px-4 py-3 max-w-xs">
                        <div className="font-semibold text-neutral-900 leading-snug">
                          {article.name}
                        </div>
                        {article.technicalSpecs && (
                          <div className="text-[11px] text-neutral-500 truncate mt-0.5" title={article.technicalSpecs}>
                            {article.technicalSpecs}
                          </div>
                        )}
                      </td>

                      {/* Hierarquia 4 Níveis */}
                      <td className="px-4 py-3 hidden md:table-cell text-[11px] text-neutral-500">
                        <div className="font-medium text-neutral-700">
                          {article.typeName}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-neutral-400">
                          <span>{article.groupName}</span>
                          <span aria-hidden="true">/</span>
                          <span>{article.subgroupName}</span>
                        </div>
                      </td>

                      {/* Localização / Endereçamento */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-neutral-700 font-medium text-[11px]">
                          <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          <span className="truncate max-w-[160px]" title={article.location}>
                            {article.location}
                          </span>
                        </div>
                      </td>

                      {/* Saldo Atual */}
                      <td className="px-4 py-3 text-right whitespace-nowrap font-mono tabular-nums">
                        <span className={`text-sm font-bold ${
                          article.currentStock <= article.minimumStock 
                            ? 'text-red-700' 
                            : 'text-neutral-900'
                        }`}>
                          {article.currentStock}
                        </span>
                        <span className="ml-1 text-[11px] font-sans font-medium text-neutral-500">
                          {article.unit}
                        </span>
                      </td>

                      {/* Estoque Mínimo */}
                      <td className="px-4 py-3 text-right hidden sm:table-cell whitespace-nowrap font-mono tabular-nums text-neutral-500 text-[11px]">
                        {article.minimumStock} {article.unit}
                      </td>

                      {/* Custo Unitário */}
                      <td className="px-4 py-3 text-right hidden lg:table-cell whitespace-nowrap font-mono tabular-nums text-neutral-700 text-[11px]">
                        {formatCurrency(article.unitCost)}
                      </td>

                      {/* Valor Total em Saldo */}
                      <td className="px-4 py-3 text-right hidden xl:table-cell whitespace-nowrap font-mono tabular-nums font-semibold text-neutral-900 text-[11px]">
                        {formatCurrency(totalValue)}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${status.badgeClass}`}>
                          {status.label}
                        </span>
                      </td>

                      {/* Ações */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedArticle(article)}
                            title="Ver Ficha Técnica Completa"
                            className="p-1 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/60 rounded"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onNavigateTab('inbound', article.id)}
                            title="Registrar Entrada"
                            className="p-1 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded"
                          >
                            <ArrowDownLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onNavigateTab('outbound', article.id)}
                            title="Registrar Saída"
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl border border-neutral-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50/75 sticky top-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold bg-neutral-900 text-white px-2 py-0.5 rounded">
                  {selectedArticle.code}
                </span>
                <h3 className="text-base font-bold text-neutral-900">
                  Ficha Cadastral do Artigo
                </h3>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="text-neutral-400 hover:text-neutral-600 p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              
              <div>
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Nome Comercial / Descrição Técnica</span>
                <p className="text-sm font-bold text-neutral-900 mt-0.5">{selectedArticle.name}</p>
              </div>

              {/* Hierarchy Breadcrumb */}
              <div className="bg-neutral-50 p-3 rounded-md border border-neutral-200 space-y-1">
                <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Estrutura Hierárquica em 4 Níveis</span>
                <div className="flex flex-wrap items-center gap-1.5 text-neutral-700 font-medium">
                  <span className="bg-white px-1.5 py-0.5 rounded border border-neutral-200 text-neutral-800">
                    Nível 1: {selectedArticle.typeName} ({selectedArticle.typeCode})
                  </span>
                  <span className="text-neutral-400">→</span>
                  <span className="bg-white px-1.5 py-0.5 rounded border border-neutral-200 text-neutral-800">
                    Nível 2: {selectedArticle.groupName} ({selectedArticle.groupCode})
                  </span>
                  <span className="text-neutral-400">→</span>
                  <span className="bg-white px-1.5 py-0.5 rounded border border-neutral-200 text-neutral-800">
                    Nível 3: {selectedArticle.subgroupName} ({selectedArticle.subgroupCode})
                  </span>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-neutral-50 p-3 rounded border border-neutral-200">
                  <span className="text-neutral-500">Saldo Atual</span>
                  <div className="text-lg font-bold font-mono text-neutral-900">
                    {selectedArticle.currentStock} {selectedArticle.unit}
                  </div>
                </div>
                <div className="bg-neutral-50 p-3 rounded border border-neutral-200">
                  <span className="text-neutral-500">Estoque Mínimo</span>
                  <div className="text-lg font-bold font-mono text-neutral-700">
                    {selectedArticle.minimumStock} {selectedArticle.unit}
                  </div>
                </div>
                <div className="bg-neutral-50 p-3 rounded border border-neutral-200">
                  <span className="text-neutral-500">Custo Unitário</span>
                  <div className="text-lg font-bold font-mono text-neutral-900">
                    {formatCurrency(selectedArticle.unitCost)}
                  </div>
                </div>
              </div>

              {/* Endereçamento */}
              <div>
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Localização de Armazenagem</span>
                <div className="flex items-center gap-2 mt-1 text-sm font-semibold text-neutral-800 bg-red-50/50 p-2.5 rounded border border-red-100">
                  <MapPin className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{selectedArticle.location}</span>
                </div>
              </div>

              {/* Especificações Técnicas */}
              {selectedArticle.technicalSpecs && (
                <div>
                  <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Parâmetros e Normas Técnicas</span>
                  <p className="mt-1 font-mono text-xs text-neutral-700 bg-neutral-100 p-2.5 rounded border border-neutral-200">
                    {selectedArticle.technicalSpecs}
                  </p>
                </div>
              )}

              {/* Descrição Detalhada com Verificação de Auditoria */}
              <div>
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Descrição Completa & Rastreabilidade de Auditoria</span>
                <p className="mt-1 text-neutral-700 leading-relaxed bg-neutral-50 p-3 rounded border border-neutral-200 whitespace-pre-wrap">
                  {selectedArticle.description}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-neutral-200 bg-neutral-50">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                Fechar
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const id = selectedArticle.id;
                    setSelectedArticle(null);
                    onNavigateTab('inbound', id);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded transition-colors"
                >
                  Registrar Entrada
                </button>
                <button
                  onClick={() => {
                    const id = selectedArticle.id;
                    setSelectedArticle(null);
                    onNavigateTab('outbound', id);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
                >
                  Registrar Saída
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
