import React, { useState, useMemo, useEffect } from 'react';
import { DEFAULT_HIERARCHY } from '../data/defaultHierarchy';
import { UnitOfMeasure, Article } from '../types/inventory';
import { 
  Boxes, 
  Sparkles, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface ArticleRegistrationViewProps {
  existingArticles: Article[];
  onSubmit: (articleData: any) => Promise<void>;
  onSuccessNavigate: () => void;
}

const COMMON_UNITS: { value: UnitOfMeasure; label: string }[] = [
  { value: 'UN', label: 'UN - Unidade' },
  { value: 'CX', label: 'CX - Caixa' },
  { value: 'KG', label: 'KG - Quilograma' },
  { value: 'M', label: 'M - Metro Linear' },
  { value: 'M2', label: 'M² - Metro Quadrado' },
  { value: 'L', label: 'L - Litro' },
  { value: 'GL', label: 'GL - Galão' },
  { value: 'PAR', label: 'PAR - Par' },
  { value: 'JG', label: 'JG - Jogo / Kit' },
  { value: 'RL', label: 'RL - Rolo' },
  { value: 'BR', label: 'BR - Barra' }
];

const PRESET_LOCATIONS = [
  'Galpão A / Estante 01 / Prateleira A',
  'Galpão A / Estante 02 / Armário CNC Gaveta 03',
  'Galpão A / Racks de Perfis Metálicos / Prateleira 01',
  'Oficina de Mecânica / Painel de Ferramentas / Gancho 08',
  'Oficina de Solda / Armário Estufa Térmica / Prateleira B',
  'Laboratório de Automação / Bancada 04 / Gaveta 02',
  'Laboratório de Comandos Elétricos / Armário E02 / Gaveta 01',
  'Sala Climatizada de Metrologia / Armário M1 / Gaveta Aferida 02',
  'Depósito de Químicos e Lubrificantes / Bacia de Contenção 02',
  'Almoxarifado Central / Prateleira EPI 01 / Caixa Plástica 04'
];

export const ArticleRegistrationView: React.FC<ArticleRegistrationViewProps> = ({
  existingArticles,
  onSubmit,
  onSuccessNavigate
}) => {
  // Cascading hierarchy state
  const [selectedTypeCode, setSelectedTypeCode] = useState<string>(DEFAULT_HIERARCHY[0].code);
  const selectedType = useMemo(() => {
    return DEFAULT_HIERARCHY.find(t => t.code === selectedTypeCode) || DEFAULT_HIERARCHY[0];
  }, [selectedTypeCode]);

  const [selectedGroupCode, setSelectedGroupCode] = useState<string>(
    selectedType.groups[0]?.code || ''
  );

  // Update selectedGroup when selectedType changes
  useEffect(() => {
    if (selectedType.groups.length > 0) {
      setSelectedGroupCode(selectedType.groups[0].code);
    }
  }, [selectedTypeCode, selectedType]);

  const selectedGroup = useMemo(() => {
    return selectedType.groups.find(g => g.code === selectedGroupCode) || selectedType.groups[0];
  }, [selectedType, selectedGroupCode]);

  const [selectedSubgroupCode, setSelectedSubgroupCode] = useState<string>(
    selectedGroup?.subgroups[0]?.code || ''
  );

  // Update selectedSubgroup when selectedGroup changes
  useEffect(() => {
    if (selectedGroup && selectedGroup.subgroups.length > 0) {
      setSelectedSubgroupCode(selectedGroup.subgroups[0].code);
    }
  }, [selectedGroupCode, selectedGroup]);

  const selectedSubgroup = useMemo(() => {
    return selectedGroup?.subgroups.find(s => s.code === selectedSubgroupCode) || selectedGroup?.subgroups[0];
  }, [selectedGroup, selectedSubgroupCode]);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [technicalSpecs, setTechnicalSpecs] = useState('');
  const [unit, setUnit] = useState<UnitOfMeasure>('UN');
  const [location, setLocation] = useState('');
  const [minimumStock, setMinimumStock] = useState('5');
  const [initialStock, setInitialStock] = useState('0');
  const [unitCost, setUnitCost] = useState('0.00');
  const [includeAuditTag, setIncludeAuditTag] = useState(true);
  const [auditorName, setAuditorName] = useState('Leonardo');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  // Automatic Code Generator Calculation
  const generatedCodePreview = useMemo(() => {
    if (!selectedTypeCode || !selectedGroupCode || !selectedSubgroupCode) {
      return 'TIP-GRP-SUB-0001';
    }
    const prefix = `${selectedTypeCode}-${selectedGroupCode}-${selectedSubgroupCode}`;
    const matchingArticles = existingArticles.filter(a => a.code.startsWith(prefix));
    
    let nextNum = 1;
    matchingArticles.forEach(a => {
      const parts = a.code.split('-');
      const num = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(num) && num >= nextNum) {
        nextNum = num + 1;
      }
    });

    let code = `${prefix}-${String(nextNum).padStart(4, '0')}`;
    while (existingArticles.some(a => a.code === code)) {
      nextNum++;
      code = `${prefix}-${String(nextNum).padStart(4, '0')}`;
    }
    return code;
  }, [selectedTypeCode, selectedGroupCode, selectedSubgroupCode, existingArticles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackError(null);
    setFeedbackSuccess(null);

    if (!name.trim()) {
      setFeedbackError('Por favor informe o nome do artigo.');
      return;
    }
    if (!location.trim()) {
      setFeedbackError('Por favor informe o endereçamento/localização física.');
      return;
    }

    let finalDescription = description.trim();
    if (includeAuditTag && auditorName.trim()) {
      const tag = `[Auditoria: ${auditorName.trim()}]`;
      if (!finalDescription.includes(tag)) {
        finalDescription = finalDescription ? `${finalDescription} ${tag}` : tag;
      }
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        typeCode: selectedTypeCode,
        groupCode: selectedGroupCode,
        subgroupCode: selectedSubgroupCode,
        typeName: selectedType.name,
        groupName: selectedGroup?.name || selectedGroupCode,
        subgroupName: selectedSubgroup?.name || selectedSubgroupCode,
        description: finalDescription,
        technicalSpecs: technicalSpecs.trim(),
        unit,
        minimumStock: Number(minimumStock) || 0,
        initialStock: Number(initialStock) || 0,
        unitCost: Number(unitCost) || 0,
        location: location.trim(),
        operatorName: `${auditorName.trim()} Silva`
      });

      setFeedbackSuccess(`Artigo "${name}" cadastrado com sucesso! Código gerado: ${generatedCodePreview}`);
      
      // Reset form
      setName('');
      setDescription('');
      setTechnicalSpecs('');
      setLocation('');
      setInitialStock('0');
      
      setTimeout(() => {
        onSuccessNavigate();
      }, 1400);
    } catch (err: any) {
      setFeedbackError(err.message || 'Erro ao salvar artigo');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="border-b border-neutral-200 pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
          Cadastro Hierárquico de Artigos
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          Estrutura formal em 4 níveis (Tipo → Grupo → Subgrupo → Artigo) com geração automática de código único.
        </p>
      </div>

      {feedbackError && (
        <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-md flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{feedbackError}</span>
        </div>
      )}

      {feedbackSuccess && (
        <div className="p-3 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{feedbackSuccess}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Estrutura Hierárquica em 4 Níveis */}
        <div className="bg-white border border-neutral-200 rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div className="flex items-center gap-2">
              <Boxes className="w-4 h-4 text-red-600" />
              <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">
                1. Hierarquia de Classificação Técnica (3 Níveis Iniciais)
              </h2>
            </div>
            <span className="text-[11px] text-neutral-400">Padronização SENAI-SP</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Level 1: Tipo */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Nível 1: Tipo de Material <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedTypeCode}
                onChange={(e) => setSelectedTypeCode(e.target.value)}
                className="w-full text-xs border border-neutral-300 rounded-md p-2.5 bg-neutral-50/50 text-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-red-600"
              >
                {DEFAULT_HIERARCHY.map(t => (
                  <option key={t.code} value={t.code}>
                    [{t.code}] {t.name}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-neutral-500 mt-1 truncate">
                {selectedType.description}
              </p>
            </div>

            {/* Level 2: Grupo */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Nível 2: Grupo <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedGroupCode}
                onChange={(e) => setSelectedGroupCode(e.target.value)}
                className="w-full text-xs border border-neutral-300 rounded-md p-2.5 bg-neutral-50/50 text-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-red-600"
              >
                {selectedType.groups.map(g => (
                  <option key={g.code} value={g.code}>
                    [{g.code}] {g.name}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-neutral-500 mt-1 truncate">
                {selectedGroup?.description}
              </p>
            </div>

            {/* Level 3: Subgrupo */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Nível 3: Subgrupo <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedSubgroupCode}
                onChange={(e) => setSelectedSubgroupCode(e.target.value)}
                className="w-full text-xs border border-neutral-300 rounded-md p-2.5 bg-neutral-50/50 text-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-red-600"
              >
                {selectedGroup?.subgroups.map(s => (
                  <option key={s.code} value={s.code}>
                    [{s.code}] {s.name}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-neutral-500 mt-1">
                Subclassificação detalhada
              </p>
            </div>

          </div>

          {/* Automatic Code Preview Box */}
          <div className="bg-neutral-900 text-white rounded-md p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                  Código Único Gerado Automaticamente
                </span>
                <span className="font-mono text-base font-bold text-amber-300 tracking-wider">
                  {generatedCodePreview}
                </span>
              </div>
            </div>
            <div className="text-[11px] text-neutral-300 sm:text-right">
              Formato padronizado: <span className="font-mono text-neutral-400">[TIPO]-[GRUPO]-[SUBGRUPO]-[SEQ]</span>
            </div>
          </div>
        </div>

        {/* Section 2: Nível 4 - Dados do Artigo */}
        <div className="bg-white border border-neutral-200 rounded-lg p-5 shadow-xs space-y-4">
          <div className="border-b border-neutral-100 pb-3">
            <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">
              2. Nível 4: Especificação Cadastral do Artigo
            </h2>
          </div>

          <div className="space-y-4">
            
            {/* Nome do Artigo */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Nome Comercial / Descrição Principal <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Broca Helicoidal de Haste Cônica HSS Ø 18,0mm DIN 345"
                className="w-full text-xs sm:text-sm border border-neutral-300 rounded-md p-2.5 focus:outline-hidden focus:ring-1 focus:ring-red-600 focus:border-red-600"
              />
            </div>

            {/* Especificações Técnicas e Dimensões */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Especificações Técnicas, Dimensões e Normas (ABNT, DIN, ISO, ANSI)
              </label>
              <input
                type="text"
                value={technicalSpecs}
                onChange={(e) => setTechnicalSpecs(e.target.value)}
                placeholder="Ex: DIN 345 | Aço Rápido HSS | Haste Cone Morse 2 | Ângulo de Ponta 118°"
                className="w-full text-xs border border-neutral-300 rounded-md p-2.5 focus:outline-hidden focus:ring-1 focus:ring-red-600"
              />
            </div>

            {/* Descrição Detalhada */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Descrição Técnica Completa & Aplicação Prática <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva detalhadamente a composição, tolerâncias, aplicação didática e oficina/laboratório de destino..."
                className="w-full text-xs border border-neutral-300 rounded-md p-2.5 focus:outline-hidden focus:ring-1 focus:ring-red-600 leading-relaxed"
              />
            </div>

            {/* Auditor Tag Verification Rule */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-md p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-neutral-800">
                    Regra de Verificação de Auditoria Obrigatória
                  </span>
                  <p className="text-[11px] text-neutral-500">
                    Anexa automaticamente o primeiro nome ao final da descrição para conformidade e rastreabilidade técnica.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={auditorName}
                  onChange={(e) => setAuditorName(e.target.value)}
                  placeholder="Seu primeiro nome"
                  className="text-xs border border-neutral-300 rounded px-2.5 py-1 w-28 bg-white font-medium"
                />
                <label className="flex items-center gap-1.5 text-xs text-neutral-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeAuditTag}
                    onChange={(e) => setIncludeAuditTag(e.target.checked)}
                    className="rounded text-red-600"
                  />
                  <span>Anexar tag</span>
                </label>
              </div>
            </div>

          </div>
        </div>

        {/* Section 3: Armazenamento, Saldo e Custos */}
        <div className="bg-white border border-neutral-200 rounded-lg p-5 shadow-xs space-y-4">
          <div className="border-b border-neutral-100 pb-3">
            <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">
              3. Endereçamento Físico e Parâmetros de Estoque
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Unidade de Medida */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Unidade de Medida <span className="text-red-500">*</span>
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as UnitOfMeasure)}
                className="w-full text-xs border border-neutral-300 rounded-md p-2.5 bg-white text-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-red-600"
              >
                {COMMON_UNITS.map(u => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>

            {/* Saldo Inicial */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Saldo Inicial Físico
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={initialStock}
                onChange={(e) => setInitialStock(e.target.value)}
                className="w-full text-xs border border-neutral-300 rounded-md p-2.5 font-mono focus:outline-hidden focus:ring-1 focus:ring-red-600"
              />
            </div>

            {/* Estoque Mínimo */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Ponto de Reposição (Mínimo) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={minimumStock}
                onChange={(e) => setMinimumStock(e.target.value)}
                className="w-full text-xs border border-neutral-300 rounded-md p-2.5 font-mono focus:outline-hidden focus:ring-1 focus:ring-red-600"
              />
            </div>

            {/* Custo Unitário (R$) */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Custo Unitário (R$)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                className="w-full text-xs border border-neutral-300 rounded-md p-2.5 font-mono focus:outline-hidden focus:ring-1 focus:ring-red-600"
              />
            </div>

          </div>

          {/* Endereçamento / Localização */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Endereçamento / Local de Armazenagem <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Galpão A / Estante 02 / Prateleira B"
                className="flex-1 text-xs border border-neutral-300 rounded-md p-2.5 focus:outline-hidden focus:ring-1 focus:ring-red-600"
              />
            </div>
            
            {/* Quick Location Pills / Suggestions */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-neutral-400 font-medium">Sugestões rápidas:</span>
              {PRESET_LOCATIONS.slice(0, 4).map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setLocation(preset)}
                  className="text-[10px] bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onSuccessNavigate}
            className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-md shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Salvando no Banco...</span>
            ) : (
              <>
                <span>Cadastrar Artigo no Estoque</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
