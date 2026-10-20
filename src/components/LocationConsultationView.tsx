import React, { useState, useMemo } from 'react';
import { Article } from '../types/inventory';
import { 
  MapPin, 
  Search, 
  Edit2, 
  Check, 
  X, 
  Boxes, 
  Building2, 
  Layers,
  ArrowRight
} from 'lucide-react';

interface LocationConsultationViewProps {
  articles: Article[];
  onUpdateArticle: (id: string, data: Partial<Article>) => Promise<void>;
  onNavigateTab: (tab: any, articleId?: string) => void;
}

export const LocationConsultationView: React.FC<LocationConsultationViewProps> = ({
  articles,
  onUpdateArticle,
  onNavigateTab
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [editedLocation, setEditedLocation] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Group articles by primary location zone (first section before '/')
  const zoneGroups = useMemo(() => {
    const map = new Map<string, Article[]>();
    
    articles.forEach(article => {
      const parts = article.location.split('/');
      const zone = parts[0]?.trim() || 'Almoxarifado Geral';
      if (!map.has(zone)) {
        map.set(zone, []);
      }
      map.get(zone)!.push(article);
    });

    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [articles]);

  const filteredArticles = useMemo(() => {
    if (!searchTerm.trim()) return articles;
    const q = searchTerm.toLowerCase();
    return articles.filter(a => 
      a.location.toLowerCase().includes(q) ||
      a.code.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.typeName.toLowerCase().includes(q)
    );
  }, [articles, searchTerm]);

  const handleStartEdit = (article: Article) => {
    setEditingArticleId(article.id);
    setEditedLocation(article.location);
  };

  const handleSaveLocation = async (articleId: string) => {
    if (!editedLocation.trim()) return;
    setIsSaving(true);
    try {
      await onUpdateArticle(articleId, { location: editedLocation.trim() });
      setEditingArticleId(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="border-b border-neutral-200 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-neutral-900 text-white rounded-md">
            <MapPin className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
              Endereçamento & Consulta em Tempo Real
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500">
              Mapeamento de galpões, armários, prateleiras, gavetas e postos de trabalho do SENAI-SP.
            </p>
          </div>
        </div>
      </div>

      {/* Zone Summary Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {zoneGroups.map(([zone, items]) => (
          <div key={zone} className="bg-white border border-neutral-200 rounded-lg p-3 shadow-xs">
            <div className="flex items-center gap-1.5 text-neutral-500 text-xs font-semibold truncate">
              <Building2 className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span className="truncate">{zone}</span>
            </div>
            <div className="text-lg font-bold text-neutral-900 font-mono mt-1 tabular-nums">
              {items.length} <span className="text-xs font-sans font-normal text-neutral-500">artigos</span>
            </div>
          </div>
        ))}
      </div>

      {/* Search Input */}
      <div className="bg-white border border-neutral-200 rounded-lg p-4 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por local (ex: Galpão A, Armário CNC, Estufa), código ou nome do artigo..."
            className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm border border-neutral-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-red-600"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-xs"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Endereçamento List */}
      <div className="bg-white border border-neutral-200 rounded-lg shadow-xs overflow-hidden">
        <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
          <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
            Listagem de Endereços Físicos ({filteredArticles.length} Artigos)
          </span>
          <span className="text-[11px] text-neutral-500">
            Clique no ícone de edição para realocar um artigo
          </span>
        </div>

        <div className="divide-y divide-neutral-200">
          {filteredArticles.map(article => {
            const isEditing = editingArticleId === article.id;

            return (
              <div 
                key={article.id}
                className="p-4 hover:bg-neutral-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-neutral-100 text-neutral-900 border border-neutral-200 px-2 py-0.5 rounded">
                      {article.code}
                    </span>
                    <span className="text-xs font-semibold text-neutral-900">
                      {article.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                    <span>{article.typeName}</span>
                    <span aria-hidden="true">·</span>
                    <span>{article.subgroupName}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-neutral-700">Saldo: {article.currentStock} {article.unit}</span>
                  </div>
                </div>

                {/* Location Display or Edit */}
                <div className="flex items-center gap-3">
                  {isEditing ? (
                    <div className="flex items-center gap-1.5 flex-1 md:w-80">
                      <input
                        type="text"
                        value={editedLocation}
                        onChange={(e) => setEditedLocation(e.target.value)}
                        className="text-xs border border-red-500 rounded px-2.5 py-1.5 w-full bg-white font-medium"
                      />
                      <button
                        onClick={() => handleSaveLocation(article.id)}
                        disabled={isSaving}
                        className="p-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                        title="Salvar Novo Endereço"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingArticleId(null)}
                        className="p-1.5 bg-neutral-200 text-neutral-700 rounded hover:bg-neutral-300 transition-colors"
                        title="Cancelar"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 px-3 py-1.5 rounded-md">
                      <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span className="text-xs font-semibold text-neutral-800">
                        {article.location}
                      </span>
                      <button
                        onClick={() => handleStartEdit(article)}
                        title="Alterar Localização"
                        className="ml-2 text-neutral-400 hover:text-neutral-700 p-0.5"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onNavigateTab('inbound', article.id)}
                      className="px-2 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-50 rounded"
                    >
                      + Entrada
                    </button>
                    <button
                      onClick={() => onNavigateTab('outbound', article.id)}
                      className="px-2 py-1 text-[11px] font-medium text-red-700 hover:bg-red-50 rounded"
                    >
                      - Saída
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
