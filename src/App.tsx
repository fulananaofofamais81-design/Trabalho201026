/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { InventoryDatabase, Article } from './types/inventory';
import { api } from './services/api';
import { Header, ActiveTab } from './components/Header';
import { Footer } from './components/Footer';
import { DashboardView } from './components/DashboardView';
import { ArticleRegistrationView } from './components/ArticleRegistrationView';
import { InboundMovementView } from './components/InboundMovementView';
import { OutboundMovementView } from './components/OutboundMovementView';
import { LocationConsultationView } from './components/LocationConsultationView';
import { ReportsAndAuditView } from './components/ReportsAndAuditView';
import { PersistenceView } from './components/PersistenceView';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [database, setDatabase] = useState<InventoryDatabase>({
    articles: [],
    movements: [],
    lastSync: new Date().toISOString(),
    syncProvider: 'local'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [targetArticleId, setTargetArticleId] = useState<string | undefined>(undefined);

  const fetchInventory = useCallback(async () => {
    try {
      const data = await api.getInventory();
      setDatabase(data);
    } catch (e) {
      console.error('Error fetching inventory:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleNavigateTab = (tab: ActiveTab, articleId?: string) => {
    setTargetArticleId(articleId);
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateArticle = async (articleData: any): Promise<void> => {
    await api.createArticle(articleData);
    await fetchInventory();
  };

  const handleUpdateArticle = async (id: string, updateData: Partial<Article>) => {
    await api.updateArticle(id, updateData);
    await fetchInventory();
  };

  const handleRegisterMovement = async (movementData: any) => {
    await api.registerMovement(movementData);
    await fetchInventory();
  };

  const handleSeedInitial = async () => {
    setIsLoading(true);
    try {
      const db = await api.seedInitial();
      setDatabase(db);
      setActiveTab('dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetEmpty = async () => {
    if (!window.confirm('Tem certeza de que deseja zerar o estoque? Todos os dados serão limpos e o almoxarifado ficará vazio pronto para novos cadastros.')) {
      return;
    }
    setIsLoading(true);
    try {
      const db = await api.resetEmpty();
      setDatabase(db);
      setActiveTab('dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const lowStockCount = database.articles.filter(
    a => a.currentStock <= a.minimumStock
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100 text-neutral-900">
      
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setTargetArticleId(undefined);
          setActiveTab(tab);
        }}
        totalArticles={database.articles.length}
        lowStockCount={lowStockCount}
        onSeedInitial={handleSeedInitial}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
            <Loader2 className="w-8 h-8 animate-spin text-red-600 mb-2" />
            <p className="text-xs font-semibold">Carregando almoxarifado SENAISTOCK...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                articles={database.articles}
                movements={database.movements}
                onNavigateTab={handleNavigateTab}
                onSeedInitial={handleSeedInitial}
              />
            )}

            {activeTab === 'register' && (
              <ArticleRegistrationView
                existingArticles={database.articles}
                onSubmit={handleCreateArticle}
                onSuccessNavigate={() => handleNavigateTab('dashboard')}
              />
            )}

            {activeTab === 'inbound' && (
              <InboundMovementView
                articles={database.articles}
                initialArticleId={targetArticleId}
                onSubmit={handleRegisterMovement}
                onSuccessNavigate={() => handleNavigateTab('dashboard')}
              />
            )}

            {activeTab === 'outbound' && (
              <OutboundMovementView
                articles={database.articles}
                initialArticleId={targetArticleId}
                onSubmit={handleRegisterMovement}
                onSuccessNavigate={() => handleNavigateTab('dashboard')}
              />
            )}

            {activeTab === 'locations' && (
              <LocationConsultationView
                articles={database.articles}
                onUpdateArticle={handleUpdateArticle}
                onNavigateTab={handleNavigateTab}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsAndAuditView
                articles={database.articles}
                movements={database.movements}
              />
            )}

            {activeTab === 'persistence' && (
              <PersistenceView
                database={database}
                onRefresh={fetchInventory}
                onSeedInitial={handleSeedInitial}
                onResetEmpty={handleResetEmpty}
              />
            )}
          </>
        )}
      </main>

      {/* Standard Footer with Mandatory Technical Responsibility */}
      <Footer />
    </div>
  );
}
