import React, { useState, useEffect } from 'react';
import { Article } from '../types/inventory';
import { formatCurrency } from '../utils/formatters';
import { 
  ArrowDownLeft, 
  Search, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  Package,
  Calendar,
  FileCheck
} from 'lucide-react';

interface InboundMovementViewProps {
  articles: Article[];
  initialArticleId?: string;
  onSubmit: (movementData: any) => Promise<void>;
  onSuccessNavigate: () => void;
}

export const InboundMovementView: React.FC<InboundMovementViewProps> = ({
  articles,
  initialArticleId,
  onSubmit,
  onSuccessNavigate
}) => {
  const [selectedArticleId, setSelectedArticleId] = useState<string>(initialArticleId || (articles[0]?.id || ''));
  const [quantity, setQuantity] = useState('1');
  const [unitCost, setUnitCost] = useState('');
  const [invoiceOrDocNumber, setInvoiceOrDocNumber] = useState('');
  const [supplierOrOrigin, setSupplierOrOrigin] = useState('');
  const [reason, setReason] = useState('Recebimento de Lote para Aulas Práticas');
  const [notes, setNotes] = useState('');
  const [operatorName, setOperatorName] = useState('Leonardo Silva');
  
  // ISO date format for input datetime-local
  const getNowLocal = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };
  const [dateTime, setDateTime] = useState(getNowLocal());

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const selectedArticle = articles.find(a => a.id === selectedArticleId);

  useEffect(() => {
    if (selectedArticle) {
      setUnitCost(selectedArticle.unitCost.toString());
    }
  }, [selectedArticleId, selectedArticle]);

  const numQuantity = Number(quantity) || 0;
  const numCost = Number(unitCost) || 0;
  const totalBatchCost = numQuantity * numCost;
  const expectedResultingStock = (selectedArticle?.currentStock || 0) + numQuantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!selectedArticle) {
      setErrorMsg('Selecione um artigo válido.');
      return;
    }
    if (numQuantity <= 0) {
      setErrorMsg('A quantidade deve ser maior que zero.');
      return;
    }
    if (!reason.trim()) {
      setErrorMsg('Informe o motivo do recebimento.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        articleId: selectedArticle.id,
        type: 'ENTRADA',
        quantity: numQuantity,
        unitCost: numCost,
        invoiceOrDocNumber: invoiceOrDocNumber.trim(),
        supplierOrOrigin: supplierOrOrigin.trim(),
        reason: reason.trim(),
        notes: notes.trim(),
        operatorName: operatorName.trim(),
        timestamp: new Date(dateTime).toISOString()
      });

      setSuccessMsg(`Entrada de ${numQuantity} ${selectedArticle.unit} de "${selectedArticle.name}" registrada com sucesso! Novo saldo: ${expectedResultingStock} ${selectedArticle.unit}.`);
      
      setTimeout(() => {
        onSuccessNavigate();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao registrar entrada');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Title */}
      <div className="border-b border-neutral-200 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-md">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
              Registro de Entrada de Materiais
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500">
              Recebimento físico de mercadorias, insumos, ferramentas e suprimentos com atualização de custo.
            </p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-md flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Article Selector & Stock Card */}
        <div className="bg-white border border-neutral-200 rounded-lg p-5 shadow-xs space-y-4">
          <label className="block text-xs font-semibold text-neutral-700">
            Selecione o Artigo para Entrada <span className="text-red-500">*</span>
          </label>
          
          <select
            value={selectedArticleId}
            onChange={(e) => setSelectedArticleId(e.target.value)}
            className="w-full text-xs sm:text-sm border border-neutral-300 rounded-md p-2.5 bg-white text-neutral-900 font-medium focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
          >
            {articles.map(a => (
              <option key={a.id} value={a.id}>
                [{a.code}] {a.name} — Saldo: {a.currentStock} {a.unit}
              </option>
            ))}
          </select>

          {selectedArticle && (
            <div className="bg-neutral-50 p-4 rounded-md border border-neutral-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-neutral-500 block text-[11px]">Código & Hierarquia</span>
                <span className="font-mono font-bold text-neutral-900">{selectedArticle.code}</span>
                <span className="block text-[11px] text-neutral-400 mt-0.5">{selectedArticle.subgroupName}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[11px]">Localização no Almoxarifado</span>
                <div className="flex items-center gap-1 font-medium text-neutral-800 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span className="truncate">{selectedArticle.location}</span>
                </div>
              </div>
              <div>
                <span className="text-neutral-500 block text-[11px]">Saldo Atual em Estoque</span>
                <span className="font-mono font-bold text-base text-neutral-900">
                  {selectedArticle.currentStock} {selectedArticle.unit}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Quantities and Dates */}
        <div className="bg-white border border-neutral-200 rounded-lg p-5 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Quantidade */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Quantidade Recebida <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full text-sm font-mono font-bold border border-neutral-300 rounded-md p-2.5 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-neutral-400">
                  {selectedArticle?.unit || 'UN'}
                </span>
              </div>
            </div>

            {/* Custo Unitário */}
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
                className="w-full text-sm font-mono border border-neutral-300 rounded-md p-2.5 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            {/* Data e Hora */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Data e Horário do Recebimento <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className="w-full text-xs border border-neutral-300 rounded-md p-2.5 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
              />
            </div>

          </div>

          {/* Stock Projection Strip */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-md p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="text-emerald-900 font-medium">
                Saldo Atual: <strong>{selectedArticle?.currentStock || 0}</strong> → Novo Saldo Projetado: <strong className="text-emerald-800 text-sm font-mono">{expectedResultingStock} {selectedArticle?.unit}</strong>
              </span>
            </div>
            <div className="text-emerald-800 font-mono font-bold">
              Total do Lote: {formatCurrency(totalBatchCost)}
            </div>
          </div>
        </div>

        {/* Invoice, Origin & Reason */}
        <div className="bg-white border border-neutral-200 rounded-lg p-5 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Nota Fiscal ou Doc */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Nº Nota Fiscal / Documento de Entrada
              </label>
              <input
                type="text"
                value={invoiceOrDocNumber}
                onChange={(e) => setInvoiceOrDocNumber(e.target.value)}
                placeholder="Ex: NF-e 91044/2026 ou Pedido Compras 104"
                className="w-full text-xs border border-neutral-300 rounded-md p-2.5 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            {/* Fornecedor ou Origem */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Fornecedor / Origem do Material
              </label>
              <input
                type="text"
                value={supplierOrOrigin}
                onChange={(e) => setSupplierOrOrigin(e.target.value)}
                placeholder="Ex: Sandvik Coromant / Gerdau / Doação Corporativa"
                className="w-full text-xs border border-neutral-300 rounded-md p-2.5 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
              />
            </div>

          </div>

          {/* Motivo */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Motivo do Recebimento <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Abastecimento de Insumos para Cursos Técnicos"
              className="w-full text-xs border border-neutral-300 rounded-md p-2.5 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Observações Técnicas / Inspeção de Qualidade
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Material inspecionado e conforme certificado de qualidade..."
              className="w-full text-xs border border-neutral-300 rounded-md p-2.5 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* Responsável */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Operador / Responsável Técnico pela Conferência
            </label>
            <input
              type="text"
              value={operatorName}
              onChange={(e) => setOperatorName(e.target.value)}
              className="w-full text-xs border border-neutral-300 rounded-md p-2.5 bg-neutral-50"
            />
          </div>

        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onSuccessNavigate}
            className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
          >
            Voltar à Posição
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !selectedArticle}
            className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-xs transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? 'Registrando...' : 'Confirmar Recebimento & Atualizar Estoque'}
          </button>
        </div>

      </form>
    </div>
  );
};
