import React from 'react';
import { 
  Boxes, 
  PlusCircle, 
  ArrowDownLeft, 
  ArrowUpRight, 
  MapPin, 
  FileText, 
  Cloud,
  CheckCircle2
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'register' | 'inbound' | 'outbound' | 'locations' | 'reports' | 'persistence';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  totalArticles: number;
  lowStockCount: number;
  onSeedInitial: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  totalArticles,
  lowStockCount,
  onSeedInitial
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 shadow-xs">
      {/* Top Bar Contract: Brand Zone - 5-6 Nav Links - Primary Action */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-6">
          
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 bg-red-600 rounded flex items-center justify-center text-white font-black tracking-wider shadow-xs">
              <span className="text-base font-extrabold tracking-tighter">S</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight text-neutral-900 leading-tight">
                SENAI<span className="text-red-600">STOCK</span>
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
                Almoxarifado & Logística SP
              </span>
            </div>
          </div>

          {/* Zone 2: Concise Nav Links (Single line, whitespace-nowrap) */}
          <nav className="hidden xl:flex items-center gap-1 overflow-x-auto py-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'dashboard'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>Posição Estoque</span>
              {lowStockCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-red-500 text-white rounded-full">
                  {lowStockCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('register')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'register'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Novo Artigo</span>
            </button>

            <button
              onClick={() => setActiveTab('inbound')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'inbound'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
              <span>Entrada</span>
            </button>

            <button
              onClick={() => setActiveTab('outbound')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'outbound'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-red-600" />
              <span>Saída</span>
            </button>

            <button
              onClick={() => setActiveTab('locations')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'locations'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Endereçamento</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'reports'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Relatórios & Auditoria</span>
            </button>

            <button
              onClick={() => setActiveTab('persistence')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'persistence'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <Cloud className="w-3.5 h-3.5 text-blue-600" />
              <span>Nuvem & Backup</span>
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action & Mobile Status */}
          <div className="flex items-center gap-2.5 shrink-0">
            {totalArticles === 0 ? (
              <button
                onClick={onSeedInitial}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-md shadow-xs transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
              >
                <span>Carregar 10 Materiais Teste</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('register')}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-md shadow-xs transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Cadastrar Artigo</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Subnav Strip for quick tab switching on small screens */}
        <div className="xl:hidden flex items-center gap-2 overflow-x-auto pb-2.5 pt-1 border-t border-neutral-100">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap shrink-0 ${
              activeTab === 'dashboard' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700'
            }`}
          >
            Posição Estoque
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap shrink-0 ${
              activeTab === 'register' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700'
            }`}
          >
            + Novo Artigo
          </button>
          <button
            onClick={() => setActiveTab('inbound')}
            className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap shrink-0 ${
              activeTab === 'inbound' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700'
            }`}
          >
            Entrada
          </button>
          <button
            onClick={() => setActiveTab('outbound')}
            className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap shrink-0 ${
              activeTab === 'outbound' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700'
            }`}
          >
            Saída
          </button>
          <button
            onClick={() => setActiveTab('locations')}
            className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap shrink-0 ${
              activeTab === 'locations' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700'
            }`}
          >
            Endereçamento
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap shrink-0 ${
              activeTab === 'reports' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700'
            }`}
          >
            Relatórios
          </button>
          <button
            onClick={() => setActiveTab('persistence')}
            className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap shrink-0 ${
              activeTab === 'persistence' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700'
            }`}
          >
            Nuvem & Backup
          </button>
        </div>
      </div>
    </header>
  );
};
