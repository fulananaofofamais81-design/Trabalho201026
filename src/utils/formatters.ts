import { Article, StockMovement } from '../types/inventory';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

export function formatDate(isoString: string): string {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  } catch {
    return isoString;
  }
}

export function formatDateOnly(isoString: string): string {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(d);
  } catch {
    return isoString;
  }
}

export function getStockStatus(current: number, min: number): {
  label: string;
  badgeClass: string;
  isLow: boolean;
} {
  if (current <= 0) {
    return {
      label: 'Sem Saldo',
      badgeClass: 'bg-red-100 text-red-800 border-red-200',
      isLow: true
    };
  }
  if (current <= min) {
    return {
      label: 'Estoque Baixo',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
      isLow: true
    };
  }
  if (current <= min * 1.5) {
    return {
      label: 'Atenção',
      badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      isLow: false
    };
  }
  return {
    label: 'Normal',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    isLow: false
  };
}

export function exportArticlesToCSV(articles: Article[]): void {
  const headers = [
    'Código',
    'Nome do Artigo',
    'Tipo',
    'Grupo',
    'Subgrupo',
    'Localização',
    'Unidade',
    'Saldo Atual',
    'Estoque Mínimo',
    'Custo Unitário (R$)',
    'Valor Total em Estoque (R$)',
    'Especificações Técnicas',
    'Descrição Completa'
  ];

  const rows = articles.map(a => [
    `"${a.code}"`,
    `"${a.name.replace(/"/g, '""')}"`,
    `"${a.typeName}"`,
    `"${a.groupName}"`,
    `"${a.subgroupName}"`,
    `"${a.location.replace(/"/g, '""')}"`,
    `"${a.unit}"`,
    a.currentStock,
    a.minimumStock,
    a.unitCost.toFixed(2),
    (a.currentStock * a.unitCost).toFixed(2),
    `"${(a.technicalSpecs || '').replace(/"/g, '""')}"`,
    `"${a.description.replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `SENAISTOCK_Posicao_Estoque_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportMovementsToCSV(movements: StockMovement[]): void {
  const headers = [
    'ID Movimento',
    'Data e Hora',
    'Tipo',
    'Código Artigo',
    'Nome Artigo',
    'Quantidade',
    'Saldo Anterior',
    'Saldo Resultante',
    'Valor Unitário (R$)',
    'Valor Total (R$)',
    'Origem / Fornecedor / Destino',
    'Responsável / Solicitante',
    'Motivo da Movimentação',
    'Nº Documento / NF',
    'Operador Responsável'
  ];

  const rows = movements.map(m => [
    `"${m.id}"`,
    `"${formatDate(m.timestamp)}"`,
    `"${m.type}"`,
    `"${m.articleCode}"`,
    `"${m.articleName.replace(/"/g, '""')}"`,
    m.quantity,
    m.previousStock,
    m.resultingStock,
    (m.unitCost || 0).toFixed(2),
    (m.totalValue || 0).toFixed(2),
    `"${(m.destinationOrSector || m.supplierOrOrigin || '-').replace(/"/g, '""')}"`,
    `"${(m.requesterName || '-').replace(/"/g, '""')}"`,
    `"${m.reason.replace(/"/g, '""')}"`,
    `"${(m.invoiceOrDocNumber || '-').replace(/"/g, '""')}"`,
    `"${m.operatorName}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `SENAISTOCK_Historico_Movimentacoes_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadJSONFile(data: any, filename: string): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
