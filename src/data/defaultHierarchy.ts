import { HierarchyType } from '../types/inventory';

export const DEFAULT_HIERARCHY: HierarchyType[] = [
  {
    code: 'MAT',
    name: 'Matéria-Prima & Ferramentaria',
    description: 'Materiais metálicos, plásticos de engenharia e insertos de usinagem',
    groups: [
      {
        code: 'MET',
        name: 'Metais Ferrosos e Ligas',
        typeCode: 'MAT',
        description: 'Barras, tubos, chapas e perfis de ligas metálicas',
        subgroups: [
          { code: 'ACO', name: 'Aços Laminados e Trefilados', groupCode: 'MET' },
          { code: 'INO', name: 'Aços Inoxidáveis e Especiais', groupCode: 'MET' },
          { code: 'ALU', name: 'Alumínio e Ligas Leves', groupCode: 'MET' }
        ]
      },
      {
        code: 'USI',
        name: 'Usinagem e Corte',
        typeCode: 'MAT',
        description: 'Elementos de corte e ferramentas intercambiáveis',
        subgroups: [
          { code: 'PAS', name: 'Pastilhas e Insertos de Metal Duro', groupCode: 'USI' },
          { code: 'FRE', name: 'Fresas Inteiriças e Bedames', groupCode: 'USI' }
        ]
      }
    ]
  },
  {
    code: 'FER',
    name: 'Ferramentas e Instrumentos',
    description: 'Ferramentas mecânicas, elétricas e equipamentos de medição',
    groups: [
      {
        code: 'MAN',
        name: 'Ferramentas Manuais de Aperto',
        typeCode: 'FER',
        description: 'Chaves, soquetes, alicates e torquímetros',
        subgroups: [
          { code: 'CHV', name: 'Chaves Combinadas e Fixas', groupCode: 'MAN' },
          { code: 'ALI', name: 'Alicates e Chaves de Fenda/Phillips', groupCode: 'MAN' },
          { code: 'TRQ', name: 'Torquímetros e Soquetes', groupCode: 'MAN' }
        ]
      },
      {
        code: 'MET',
        name: 'Metrologia Dimensional',
        typeCode: 'FER',
        description: 'Instrumentos aferidos de medição de precisão',
        subgroups: [
          { code: 'MIC', name: 'Micrômetros e Relógios Comparadores', groupCode: 'MET' },
          { code: 'PAQ', name: 'Paquímetros Universais e Digitais', groupCode: 'MET' }
        ]
      },
      {
        code: 'FUR',
        name: 'Furação e Mandrilamento',
        typeCode: 'FER',
        description: 'Brocas, machos, cossinetes e alargadores',
        subgroups: [
          { code: 'BRO', name: 'Brocas HSS e Metal Duro', groupCode: 'FUR' },
          { code: 'MAC', name: 'Machos e Cossinetes para Rosca', groupCode: 'FUR' }
        ]
      }
    ]
  },
  {
    code: 'EPI',
    name: 'Equipamentos de Proteção Individual',
    description: 'Materiais de proteção individual e conformidade com NR-06',
    groups: [
      {
        code: 'PRO',
        name: 'Proteção de Membros e Face',
        typeCode: 'EPI',
        description: 'Luvas, óculos, capacetes e calçados técnicos',
        subgroups: [
          { code: 'LUV', name: 'Luvas de Proteção Mecânica e Térmica', groupCode: 'PRO' },
          { code: 'OCU', name: 'Óculos de Segurança e Viseiras', groupCode: 'PRO' },
          { code: 'RES', name: 'Proteção Respiratória e Auditiva', groupCode: 'PRO' }
        ]
      }
    ]
  },
  {
    code: 'ELE',
    name: 'Componentes Elétricos e Eletrônicos',
    description: 'Automação, comandos elétricos, sensores e atuadores',
    groups: [
      {
        code: 'AUT',
        name: 'Automação e Controle',
        typeCode: 'ELE',
        description: 'Sensores, controladores lógicos e fontes chaveadas',
        subgroups: [
          { code: 'SEN', name: 'Sensores Industriais Indutivos/Ópticos', groupCode: 'AUT' },
          { code: 'CLP', name: 'Módulos de CLP e Relés de Segurança', groupCode: 'AUT' }
        ]
      },
      {
        code: 'POT',
        name: 'Chaveamento e Força',
        typeCode: 'ELE',
        description: 'Contatores, disjuntores-motores e bornes',
        subgroups: [
          { code: 'CON', name: 'Contatores e Relés Térmicos', groupCode: 'POT' },
          { code: 'DIS', name: 'Disjuntores DIN e Chaves Seccionadoras', groupCode: 'POT' }
        ]
      }
    ]
  },
  {
    code: 'INS',
    name: 'Insumos e Consumíveis',
    description: 'Fluidos de corte, soldas, abrasivos e fixação química',
    groups: [
      {
        code: 'SOL',
        name: 'Soldagem e Caldeiraria',
        typeCode: 'INS',
        description: 'Eletrodos, arames, varetas e bicos de gás',
        subgroups: [
          { code: 'ELE', name: 'Eletrodos e Consumíveis de Solda', groupCode: 'SOL' },
          { code: 'ARA', name: 'Arames MIG/MAG e Varetas TIG', groupCode: 'SOL' }
        ]
      },
      {
        code: 'LUB',
        name: 'Óleos, Fluidos e Lubrificantes',
        typeCode: 'INS',
        description: 'Óleos solúveis, graxas industriais e desengraxantes',
        subgroups: [
          { code: 'SOL', name: 'Fluidos de Corte e Refrigeração', groupCode: 'LUB' },
          { code: 'GRA', name: 'Graxas e Lubrificantes Sintéticos', groupCode: 'LUB' }
        ]
      }
    ]
  },
  {
    code: 'MEC',
    name: 'Elementos de Máquinas',
    description: 'Rolamentos, retentores, parafusos de alta resistência e correias',
    groups: [
      {
        code: 'FIX',
        name: 'Elementos de Fixação',
        typeCode: 'MEC',
        description: 'Parafusos sextavados, allen, porcas e arruelas',
        subgroups: [
          { code: 'PAR', name: 'Parafusos e Porcas Grau 8.8 e 10.9', groupCode: 'FIX' },
          { code: 'ARR', name: 'Arruelas de Pressão e Anéis Elásticos', groupCode: 'FIX' }
        ]
      },
      {
        code: 'TRA',
        name: 'Transmissão e Mancais',
        typeCode: 'MEC',
        description: 'Rolamentos, mancais e acoplamentos',
        subgroups: [
          { code: 'ROL', name: 'Rolamentos Rígidos de Esferas', groupCode: 'TRA' }
        ]
      }
    ]
  }
];

export function findHierarchyNames(typeCode: string, groupCode: string, subgroupCode: string) {
  const type = DEFAULT_HIERARCHY.find(t => t.code === typeCode);
  const typeName = type?.name || typeCode;
  const group = type?.groups.find(g => g.code === groupCode);
  const groupName = group?.name || groupCode;
  const subgroup = group?.subgroups.find(s => s.code === subgroupCode);
  const subgroupName = subgroup?.name || subgroupCode;

  return { typeName, groupName, subgroupName };
}
