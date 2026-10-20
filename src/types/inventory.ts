export interface HierarchyLevel {
  code: string;
  name: string;
  description?: string;
}

export interface HierarchySubgroup extends HierarchyLevel {
  groupCode: string;
}

export interface HierarchyGroup extends HierarchyLevel {
  typeCode: string;
  subgroups: HierarchySubgroup[];
}

export interface HierarchyType extends HierarchyLevel {
  groups: HierarchyGroup[];
}

export type UnitOfMeasure = 'UN' | 'CX' | 'KG' | 'M' | 'M2' | 'L' | 'GL' | 'PAR' | 'JG' | 'RL' | 'BR';

export interface Article {
  id: string;
  code: string; // e.g. MAT-MET-ACO-0001
  name: string;
  typeCode: string;
  groupCode: string;
  subgroupCode: string;
  typeName: string;
  groupName: string;
  subgroupName: string;
  description: string;
  technicalSpecs?: string;
  unit: UnitOfMeasure;
  currentStock: number;
  minimumStock: number;
  unitCost: number; // In BRL (R$)
  location: string; // e.g. "Galpão A / Estante 02 / Prateleira B"
  createdAt: string;
  updatedAt: string;
}

export type MovementType = 'ENTRADA' | 'SAIDA';

export interface StockMovement {
  id: string;
  articleId: string;
  articleCode: string;
  articleName: string;
  type: MovementType;
  quantity: number;
  previousStock: number;
  resultingStock: number;
  unitCost?: number; // For ENTRADA
  totalValue?: number;
  invoiceOrDocNumber?: string;
  supplierOrOrigin?: string; // For ENTRADA
  destinationOrSector?: string; // For SAIDA (e.g. Laboratório CNC, Oficina Mecânica)
  requesterName?: string; // For SAIDA
  reason: string;
  notes?: string;
  operatorName: string; // Responsible technical user (e.g. Leonardo Silva)
  timestamp: string;
}

export interface InventoryDatabase {
  articles: Article[];
  movements: StockMovement[];
  lastSync?: string;
  syncProvider?: 'local' | 'github' | 'drive';
}

export interface GitHubSyncConfig {
  token: string;
  gistId?: string;
  autoSync: boolean;
  lastSyncedAt?: string;
}
