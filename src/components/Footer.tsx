import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-neutral-200 bg-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-600">
          
          {/* Identity & Legal */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-900">SENAI-SP</span>
            <span aria-hidden="true" className="text-neutral-300">·</span>
            <span>Serviço Nacional de Aprendizagem Industrial</span>
            <span aria-hidden="true" className="text-neutral-300">·</span>
            <span>Almoxarifado & Controle Técnico de Materiais</span>
          </div>

          {/* Technical Responsibility & Version (Mandatory Requirement) */}
          <div className="flex flex-wrap items-center gap-2 text-neutral-500">
            <span>Desenvolvido por <strong className="text-neutral-800 font-semibold">Leonardo Silva</strong> — Responsável Técnico</span>
            <span aria-hidden="true" className="text-neutral-300">·</span>
            <span className="font-mono text-neutral-700">SENAISTOCK v2.4.0</span>
            <span aria-hidden="true" className="text-neutral-300">·</span>
            <span className="text-neutral-400">São Paulo - SP</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
