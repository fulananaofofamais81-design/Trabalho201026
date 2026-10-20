import React, { useState, useEffect } from 'react';
import { Article } from '../types/inventory';
import { 
  ArrowUpRight, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle,
  UserCheck
} from 'lucide-react';

interface OutboundMovementViewProps {
  articles: Article[];
  initialArticleId?: string;
  onSubmit: (movementData: any) => Promise<void>;
  onSuccessNavigate: () => void;
}

const COMMON_DESTINATIONS = [
  'Oficina de Mecânica de Usinagem - Turma T-MEC-24',
  'Oficina de Caldeiraria e Soldagem - Turma Noite',
  'Laboratório de Automação e CLP - Turma Mecatrônica',
  'Laboratório de Comandos Elétricos e Força',
  'Sala Climatizada de Metrologia e Qualidade',
  'Manutenção Predial e Infraestrutura do SENAI',
  'Oficina de Ajustagem Mecânica e Ferramentaria',
  'Projeto Integrador e TCC Técnico'
];

export const OutboundMovementView: React.FC<OutboundMovementViewProps> = ({
  articles,
  initialArticleId,
  onSubmit,
  onSuccessNavigate
}) => {
  const [selectedArticleId, setSelectedArticleId] = useState<string>(initialArticleId || (articles[0]?.id || ''));
  const [quantity, setQuantity] = useState('1');
  const [destinationOrSector, setDestinationOrSector] = useState(COMMON_DESTINATIONS[0]);
  const [requesterName, setRequesterName] = useState('Prof. Carlos Alberto (Instrutor Técnico)');
  const [reason, setReason] = useState('Aula Prática em Oficina / Projeto Integrador');
  const [notes, setNotes] = useState('');
  const [operatorName, setOperatorName] = useState('Leonardo Silva');

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

  const currentStock = selectedArticle?.currentStock || 0;
  const numQuantity = Number(quantity) || 0;
  const isInsufficientStock = numQuantity > currentStock;
  const projectedRemainingStock = currentStock - numQuantity;

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
    // Validation preventing negative balance
    if (isInsufficientStock) {
      setErrorMsg(`Saldo insuficiente! O saldo atual de "${selectedArticle.name}" é de ${currentStock} ${selectedArticle.unit}, insuficiente para a retirada solicitada de ${numQuantity} ${selectedArticle.unit}.`);
      return;
    }
    if (!destinationOrSector.trim()) {
      setErrorMsg('Informe o setor, turma ou laboratório de destino.');
      return;
    }
    if (!requesterName.trim()) {
      setErrorMsg('Informe o solicitante responsável pela retirada.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        articleId: selectedArticle.id,
        type: 'SAIDA',
        quantity: numQuantity,
        destinationOrSector: destinationOrSector.trim(),
        requesterName: requesterName.trim(),
        reason: reason.trim(),
        notes: notes.trim(),
        operatorName: operatorName.trim(),
        timestamp: new Date(dateTime).toISOString()
      });

      setSuccessMsg(`Baixa de ${numQuantity} ${selectedArticle.unit} de "${selectedArticle.name}" realizada com sucesso! Saldo remanescente em estoque: ${projectedRemainingStock} ${selectedArticle.unit}.`);
      
      setTimeout(() => {
        onSuccessNavigate();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao registrar saída de estoque');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Title */}
      <div className="border-b border-neutral-200 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-red-100 text-red-700 rounded-md">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
              Registro de Saída / Baixa de Materiais
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500">
              Retirada para aulas práticas, oficinas e laboratórios com trava obrigatória contra estoque negativo.
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
            Selecione o Artigo para Baixa <span className="text-red-500">*</span>
          </label>
          
          <select
            value={selectedArticleId}
            onChange={(e) => setSelectedArticleId(e.target.value)}
            className="w-full text-xs sm:text-sm border border-neutral-300 rounded-md p-2.5 bg-white text-neutral-900 font-medium focus:outline-hidden focus:ring-1 focus:ring-red-600"
          >
            {articles.map(a => (
              <option key={a.id} value={a.id}>
                [{a.code}] {a.name} — Saldo Disponível: {a.currentStock} {a.unit}
              </option>
            ))}
          </select>

          {selectedArticle && (
            <div className="bg-neutral-50 p-4 rounded-md border border-neutral-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-neutral-500 block text-[11px]">Código & Subgrupo</span>
                <span className="font-mono font-bold text-neutral-900">{selectedArticle.code}</span>
                <span className="block text-[11px] text-neutral-400 mt-0.5">{selectedArticle.subgroupName}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[11px]">Local de Armazenagem</span>
                <div className="flex items-center gap-1 font-medium text-neutral-800 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span className="truncate">{selectedArticle.location}</span>
                </div>
              </div>
              <div>
                <span className="text-neutral-500 block text-[11px]">Saldo Físico Disponível</span>
                <span className={`font-mono font-bold text-base ${currentStock <= 0 ? 'text-red-600' : 'text-neutral-900'}`}>
                  {currentStock} {selectedArticle.unit}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Quantities & Trava contra Estoque Negativo */}
        <div className="bg-white border border-neutral-200 rounded-lg p-5 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Quantidade Solicitada */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Quantidade a Retirar <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className={`w-full text-sm font-mono font-bold border rounded-md p-2.5 focus:outline-hidden focus:ring-1 ${
                    isInsufficientStock 
                      ? 'border-red-500 text-red-700 bg-red-50/50 focus:ring-red-600' 
                      : 'border-neutral-300 focus:ring-red-600'
                  }`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-neutral-400">
                  {selectedArticle?.unit || 'UN'}
                </span>
              </div>
            </div>

            {/* Data e Hora */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Data e Horário da Saída <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className="w-full text-xs border border-neutral-300 rounded-md p-2.5 focus:outline-hidden focus:ring-1 focus:ring-red-600"
              />
            </div>

          </div>

          {/* Validation Notice Strip */}
          {isInsufficientStock ? (
            <div className="bg-red-50 border border-red-300 rounded-md p-3 text-xs text-red-800 flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-red-900 block">
                  Bloqueio de Saldo: Estoque Negativo Não Permitido!
                </strong>
                <span>
                  A quantidade solicitada ({numQuantity} {selectedArticle?.unit}) excede o saldo físico atual ({currentStock} {selectedArticle?.unit}). Ajuste a quantidade para no máximo {currentStock} para prosseguir.
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-neutral-50 border border-neutral-200 rounded-md p-3 flex items-center justify-between text-xs">
              <span className="text-neutral-700 font-medium">
                Saldo Atual: <strong>{currentStock}</strong> → Saldo Remanescente após Saída: <strong className="text-neutral-900 font-mono text-sm">{projectedRemainingStock} {selectedArticle?.unit}</strong>
              </span>
              {projectedRemainingStock <= (selectedArticle?.minimumStock || 0) && (
                <span className="text-amber-700 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Atingirá Estoque Mínimo
                </span>
              )}
            </div>
          )}
        </div>

        {/* Destination, Requester and Reason */}
        <div className="bg-white border border-neutral-200 rounded-lg p-5 shadow-xs space-y-4">
          
          {/* Destino / Setor */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Laboratório, Oficina ou Turma de Destino <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={destinationOrSector}
              onChange={(e) => setDestinationOrSector(e.target.value)}
              placeholder="Ex: Oficina Mecânica - Turma T-MEC-24"
              className="w-full text-xs border border-neutral-300 rounded-md p-2.5 focus:outline-hidden focus:ring-1 focus:ring-red-600"
            />
            {/* Quick preset chips */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-neutral-400">Sugestões:</span>
              {COMMON_DESTINATIONS.slice(0, 3).map((dest, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setDestinationOrSector(dest)}
                  className="text-[10px] bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded transition-colors"
                >
                  {dest}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Solicitante */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Instrutor / Solicitante Responsável <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={requesterName}
                onChange={(e) => setRequesterName(e.target.value)}
                placeholder="Ex: Prof. Carlos Alberto"
                className="w-full text-xs border border-neutral-300 rounded-md p-2.5 focus:outline-hidden focus:ring-1 focus:ring-red-600"
              />
            </div>

            {/* Operador */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Operador do Almoxarifado (Auditoria)
              </label>
              <input
                type="text"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                className="w-full text-xs border border-neutral-300 rounded-md p-2.5 bg-neutral-50"
              />
            </div>

          </div>

          {/* Motivo */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Finalidade / Motivo da Retirada <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Execução de Prática de Torneamento e Fresamento"
              className="w-full text-xs border border-neutral-300 rounded-md p-2.5 focus:outline-hidden focus:ring-1 focus:ring-red-600"
            />
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Observações / Instruções Especiais
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Peça retirada sob cautela técnica. Devolução de sobras prevista para o fim do módulo."
              className="w-full text-xs border border-neutral-300 rounded-md p-2.5 focus:outline-hidden focus:ring-1 focus:ring-red-600"
            />
          </div>

        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onSuccessNavigate}
            className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
          >
            Voltar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isInsufficientStock || currentStock <= 0}
            className="px-5 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-md shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isInsufficientStock ? (
              <span>Saldo Insuficiente (Bloqueado)</span>
            ) : isSubmitting ? (
              <span>Registrando Baixa...</span>
            ) : (
              <span>Confirmar Baixa & Atualizar Saldo</span>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
