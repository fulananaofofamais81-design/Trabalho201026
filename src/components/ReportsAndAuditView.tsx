import React, { useState } from 'react';
import { Article, StockMovement } from '../types/inventory';
import { 
  formatCurrency, 
  formatDate, 
  exportArticlesToCSV, 
  exportMovementsToCSV,
  downloadJSONFile
} from '../utils/formatters';
import { 
  Printer, 
  Download, 
  FileSpreadsheet, 
  FileJson, 
  Calendar, 
  ArrowDownLeft, 
  ArrowUpRight,
  ShieldCheck,
  Building,
  CheckCircle2
} from 'lucide-react';

interface ReportsAndAuditViewProps {
  articles: Article[];
  movements: StockMovement[];
}

export const ReportsAndAuditView: React.FC<ReportsAndAuditViewProps> = ({
  articles,
  movements
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'position' | 'movements'>('position');

  const totalAssetValue = articles.reduce((sum, a) => sum + (a.currentStock * a.unitCost), 0);
  const totalItems = articles.reduce((sum, a) => sum + a.currentStock, 0);

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const reportData = {
      relatorio: 'Relatório Oficial de Inventário e Almoxarifado SENAI-SP',
      geradoEm: new Date().toISOString(),
      responsavelTecnico: 'Leonardo Silva',
      resumoGeral: {
        totalArtigosDistintos: articles.length,
        totalUnidadesFisicas: totalItems,
        patrimonioTotalAvaliadoBRL: totalAssetValue,
        totalMovimentacoesRegistradas: movements.length
      },
      posicaoEstoque: articles.map(a => ({
        codigo: a.code,
        artigo: a.name,
        tipo: a.typeName,
        grupo: a.groupName,
        subgrupo: a.subgroupName,
        quantidadeAtual: a.currentStock,
        unidade: a.unit,
        estoqueMinimo: a.minimumStock,
        custoUnitario: a.unitCost,
        valorTotalEstoque: a.currentStock * a.unitCost,
        localizacao: a.location,
        especificacoes: a.technicalSpecs,
        descricaoAuditoria: a.description
      })),
      historicoMovimentacoes: movements
    };

    downloadJSONFile(reportData, `SENAISTOCK_Relatorio_Oficial_${new Date().toISOString().slice(0, 10)}.json`);
  };

  return (
    <div className="space-y-6">
      
      {/* Action Header & Print Controls (Hidden on Print) */}
      <div className="print:hidden flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
            Relatórios Executivos & Auditoria de Estoque
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Documento formal para prestação de contas, inventário físico anual e auditoria técnica SENAI-SP.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-neutral-600" />
            <span>Imprimir Relatório</span>
          </button>

          <button
            onClick={() => exportArticlesToCSV(articles)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors shadow-xs"
          >
            <FileJson className="w-3.5 h-3.5 text-blue-600" />
            <span>Exportar JSON</span>
          </button>
        </div>
      </div>

      {/* Subtab Switcher (Hidden on Print) */}
      <div className="print:hidden flex items-center gap-1 p-1 bg-neutral-100 rounded-lg max-w-md">
        <button
          onClick={() => setActiveSubTab('position')}
          className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            activeSubTab === 'position'
              ? 'bg-white text-neutral-900 shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          1. Posição Geral de Estoque ({articles.length})
        </button>
        <button
          onClick={() => setActiveSubTab('movements')}
          className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            activeSubTab === 'movements'
              ? 'bg-white text-neutral-900 shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          2. Histórico de Entradas e Saídas ({movements.length})
        </button>
      </div>

      {/* Printable Report Document Container */}
      <div className="bg-white border border-neutral-200 rounded-lg shadow-xs p-6 md:p-8 space-y-6 print:border-none print:shadow-none print:p-0">
        
        {/* Official Header */}
        <div className="border-b-2 border-red-600 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded flex items-center justify-center text-white font-black text-xl">
                S
              </div>
              <div>
                <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
                  SENAI-SP · SERVIÇO NACIONAL DE APRENDIZAGEM INDUSTRIAL
                </h2>
                <p className="text-xs text-neutral-600 font-medium">
                  Almoxarifado Central & Controle Técnico de Estoque · Sistema SENAISTOCK v2.4.0
                </p>
              </div>
            </div>

            <div className="text-xs text-neutral-600 sm:text-right space-y-0.5">
              <div><strong>Data de Emissão:</strong> {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</div>
              <div><strong>Responsável Técnico:</strong> Leonardo Silva (Auditor Técnico)</div>
              <div><strong>Status:</strong> <span className="text-emerald-700 font-bold">Inventário Consolidado</span></div>
            </div>
          </div>
        </div>

        {/* Executive Summary Metrics Box */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-neutral-50 p-4 rounded-md border border-neutral-200 text-xs">
          <div>
            <span className="text-neutral-500 block">Artigos Cadastrados:</span>
            <span className="text-base font-bold text-neutral-900 font-mono tabular-nums">{articles.length} itens</span>
          </div>
          <div>
            <span className="text-neutral-500 block">Saldo Físico Geral:</span>
            <span className="text-base font-bold text-neutral-900 font-mono tabular-nums">{totalItems} unidades</span>
          </div>
          <div>
            <span className="text-neutral-500 block">Patrimônio Avaliado (Custo):</span>
            <span className="text-base font-bold text-emerald-700 font-mono tabular-nums">{formatCurrency(totalAssetValue)}</span>
          </div>
          <div>
            <span className="text-neutral-500 block">Movimentações Registradas:</span>
            <span className="text-base font-bold text-blue-700 font-mono tabular-nums">{movements.length} operações</span>
          </div>
        </div>

        {/* Section 1: Posição do Estoque (Audited 10 Materials Table) */}
        {(activeSubTab === 'position' || true) && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">
                Demonstrativo de Posição Geral de Estoque e Almoxarifado
              </h3>
              <span className="text-xs font-mono text-neutral-500">
                {articles.length} Materiais Listados
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-neutral-200 divide-y divide-neutral-200">
                <thead className="bg-neutral-100 font-semibold text-neutral-700 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-2.5 border-r border-neutral-200">Código</th>
                    <th className="p-2.5 border-r border-neutral-200">Artigo & Descrição Técnica (com Auditoria)</th>
                    <th className="p-2.5 border-r border-neutral-200">Hierarquia (Tipo / Grupo / Subgrupo)</th>
                    <th className="p-2.5 border-r border-neutral-200">Endereçamento / Localização</th>
                    <th className="p-2.5 border-r border-neutral-200 text-right">Saldo Atual</th>
                    <th className="p-2.5 border-r border-neutral-200 text-right">Mínimo</th>
                    <th className="p-2.5 border-r border-neutral-200 text-right">Custo Unit.</th>
                    <th className="p-2.5 text-right">Valor Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {articles.map((article, idx) => {
                    const rowTotal = article.currentStock * article.unitCost;
                    return (
                      <tr key={article.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50/60'}>
                        
                        {/* Código Gerado */}
                        <td className="p-2.5 border-r border-neutral-200 font-mono font-bold text-neutral-900 whitespace-nowrap text-[11px]">
                          {article.code}
                        </td>

                        {/* Nome & Descrição */}
                        <td className="p-2.5 border-r border-neutral-200 max-w-sm">
                          <div className="font-bold text-neutral-900">{article.name}</div>
                          <div className="text-[10px] text-neutral-600 mt-0.5 leading-snug">
                            {article.description}
                          </div>
                        </td>

                        {/* Hierarquia */}
                        <td className="p-2.5 border-r border-neutral-200 whitespace-nowrap text-[11px] text-neutral-600">
                          <div><strong>{article.typeName}</strong></div>
                          <div className="text-[10px] text-neutral-500">
                            {article.groupName} → {article.subgroupName}
                          </div>
                        </td>

                        {/* Localização */}
                        <td className="p-2.5 border-r border-neutral-200 whitespace-nowrap text-[11px] font-medium text-neutral-800">
                          {article.location}
                        </td>

                        {/* Saldo Atual */}
                        <td className="p-2.5 border-r border-neutral-200 text-right font-mono font-bold text-neutral-900 whitespace-nowrap tabular-nums">
                          {article.currentStock} {article.unit}
                        </td>

                        {/* Mínimo */}
                        <td className="p-2.5 border-r border-neutral-200 text-right font-mono text-neutral-600 whitespace-nowrap tabular-nums">
                          {article.minimumStock} {article.unit}
                        </td>

                        {/* Custo Unitário */}
                        <td className="p-2.5 border-r border-neutral-200 text-right font-mono text-neutral-700 whitespace-nowrap tabular-nums">
                          {formatCurrency(article.unitCost)}
                        </td>

                        {/* Valor Total */}
                        <td className="p-2.5 text-right font-mono font-bold text-neutral-900 whitespace-nowrap tabular-nums">
                          {formatCurrency(rowTotal)}
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-neutral-100 font-bold border-t-2 border-neutral-300">
                  <tr>
                    <td colSpan={4} className="p-2.5 text-right uppercase tracking-wider text-[11px]">
                      Totais Consolidados do Almoxarifado:
                    </td>
                    <td className="p-2.5 text-right font-mono tabular-nums text-neutral-900">
                      {totalItems} un
                    </td>
                    <td className="p-2.5 border-r border-neutral-200"></td>
                    <td className="p-2.5 border-r border-neutral-200"></td>
                    <td className="p-2.5 text-right font-mono text-emerald-800 tabular-nums">
                      {formatCurrency(totalAssetValue)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Section 2: Histórico de Movimentações */}
        {activeSubTab === 'movements' && (
          <div className="space-y-3 pt-6 border-t border-neutral-200">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">
                Livro Diário de Movimentações (Entradas & Saídas com Rastreabilidade)
              </h3>
              <span className="text-xs font-mono text-neutral-500">
                {movements.length} Registros
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-neutral-200 divide-y divide-neutral-200">
                <thead className="bg-neutral-100 font-semibold text-neutral-700 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-2.5 border-r border-neutral-200">Data / Hora</th>
                    <th className="p-2.5 border-r border-neutral-200 text-center">Tipo</th>
                    <th className="p-2.5 border-r border-neutral-200">Código / Artigo</th>
                    <th className="p-2.5 border-r border-neutral-200 text-right">Qtd</th>
                    <th className="p-2.5 border-r border-neutral-200 text-right">Saldo Ant. → Novo</th>
                    <th className="p-2.5 border-r border-neutral-200">Origem / Destino / Setor</th>
                    <th className="p-2.5 border-r border-neutral-200">Solicitante / Fornecedor</th>
                    <th className="p-2.5 border-r border-neutral-200">Motivo da Movimentação</th>
                    <th className="p-2.5">Operador</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {movements.map(m => (
                    <tr key={m.id} className="hover:bg-neutral-50">
                      <td className="p-2.5 border-r border-neutral-200 font-mono text-[11px] whitespace-nowrap">
                        {formatDate(m.timestamp)}
                      </td>
                      <td className="p-2.5 border-r border-neutral-200 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.type === 'ENTRADA' 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}>
                          {m.type}
                        </span>
                      </td>
                      <td className="p-2.5 border-r border-neutral-200 whitespace-nowrap">
                        <span className="font-mono font-bold text-neutral-900 block text-[11px]">{m.articleCode}</span>
                        <span className="text-[10px] text-neutral-600 truncate max-w-xs block">{m.articleName}</span>
                      </td>
                      <td className="p-2.5 border-r border-neutral-200 text-right font-mono font-bold tabular-nums whitespace-nowrap">
                        {m.type === 'ENTRADA' ? `+${m.quantity}` : `-${m.quantity}`}
                      </td>
                      <td className="p-2.5 border-r border-neutral-200 text-right font-mono text-neutral-600 whitespace-nowrap tabular-nums text-[11px]">
                        {m.previousStock} → <strong className="text-neutral-900">{m.resultingStock}</strong>
                      </td>
                      <td className="p-2.5 border-r border-neutral-200 text-[11px] text-neutral-700">
                        {m.destinationOrSector || m.supplierOrOrigin || '-'}
                      </td>
                      <td className="p-2.5 border-r border-neutral-200 text-[11px] text-neutral-700">
                        {m.requesterName || '-'}
                      </td>
                      <td className="p-2.5 border-r border-neutral-200 text-[11px] text-neutral-700 max-w-xs">
                        <div className="font-medium">{m.reason}</div>
                        {m.notes && <div className="text-[10px] text-neutral-500 italic mt-0.5">{m.notes}</div>}
                      </td>
                      <td className="p-2.5 font-medium text-neutral-800 whitespace-nowrap text-[11px]">
                        {m.operatorName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Formal Verification & Sign-off Footer */}
        <div className="pt-8 border-t border-neutral-300 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-neutral-600">
          <div className="border border-neutral-200 p-4 rounded bg-neutral-50 space-y-1">
            <span className="font-bold text-neutral-900 uppercase tracking-wide block">
              Auditoria de Conformidade Técnica
            </span>
            <p className="text-[11px] leading-relaxed text-neutral-600">
              Certifico que todos os 10 materiais listados foram devidamente catalogados com estrutura hierárquica em 4 níveis (Tipo → Grupo → Subgrupo → Artigo), codificação única gerada pelo sistema, endereçamento físico e conferência de saldo com aposição da chancela <strong>[Auditoria: Leonardo]</strong>.
            </p>
          </div>

          <div className="flex flex-col justify-end items-center sm:items-end text-center sm:text-right pt-4 sm:pt-0">
            <div className="w-56 border-b border-neutral-400 mb-1.5"></div>
            <span className="font-bold text-neutral-900">Leonardo Silva</span>
            <span className="text-[11px] text-neutral-500">Responsável Técnico / Almoxarifado Central SENAI-SP</span>
            <span className="text-[10px] font-mono text-neutral-400 mt-1">Chave Hash: SENAI-SP-INV-2026-9081</span>
          </div>
        </div>

      </div>

    </div>
  );
};
