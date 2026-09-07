/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { InvoiceList } from './components/InvoiceList';
import { PointOfSale } from './components/PointOfSale';
import { WalletNodeView } from './components/WalletNodeView';
import { PaymentRequestsView } from './components/PaymentRequestsView';
import { WebhooksApiView } from './components/WebhooksApiView';
import { ReportsView } from './components/ReportsView';
import { StoreSettingsView } from './components/StoreSettingsView';
import { BTCPayCheckoutModal } from './components/BTCPayCheckoutModal';
import { CreateInvoiceModal } from './components/CreateInvoiceModal';
import { CreateStoreModal } from './components/CreateStoreModal';
import { Store, Invoice } from './types/btcpay';
import { BTCPayStorageService } from './services/storage';

export default function App() {
  const [stores, setStores] = useState<Store[]>(() => BTCPayStorageService.getStores());
  const [activeStore, setActiveStore] = useState<Store>(() => BTCPayStorageService.getActiveStore());
  const [activeTab, setActiveTab] = useState<string>('invoices');
  const [network, setNetwork] = useState<'mainnet' | 'testnet'>('mainnet');

  // Invoices state
  const [invoices, setInvoices] = useState<Invoice[]>(() =>
    BTCPayStorageService.getInvoices(activeStore.id)
  );

  // Modals state
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState<boolean>(false);
  const [showCreateStoreModal, setShowCreateStoreModal] = useState<boolean>(false);

  // Sync invoices when active store changes
  useEffect(() => {
    setInvoices(BTCPayStorageService.getInvoices(activeStore.id));
  }, [activeStore.id]);

  const handleSelectStore = (storeId: string) => {
    BTCPayStorageService.setActiveStore(storeId);
    const matched = stores.find((s) => s.id === storeId);
    if (matched) {
      setActiveStore(matched);
    }
  };

  const handleInvoiceCreated = (invoice: Invoice) => {
    setInvoices(BTCPayStorageService.getInvoices(activeStore.id));
    setSelectedInvoice(invoice);
    setShowCheckoutModal(true);
  };

  const handleInvoiceUpdated = (updated: Invoice) => {
    setInvoices(BTCPayStorageService.getInvoices(activeStore.id));
    if (selectedInvoice && selectedInvoice.id === updated.id) {
      setSelectedInvoice(updated);
    }
  };

  const handleOpenCheckout = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowCheckoutModal(true);
  };

  const handleStoreCreated = (newStore: Store) => {
    setStores(BTCPayStorageService.getStores());
    setActiveStore(newStore);
  };

  const handleStoreUpdated = (updated: Store) => {
    setStores(BTCPayStorageService.getStores());
    setActiveStore(updated);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F8F8F8] flex flex-col font-sans selection:bg-orange-500 selection:text-black">
      {/* Global Header & Navigation */}
      <Header
        stores={stores}
        activeStore={activeStore}
        onSelectStore={handleSelectStore}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenNewInvoice={() => setShowCreateInvoiceModal(true)}
        onOpenCreateStore={() => setShowCreateStoreModal(true)}
        network={network}
        onToggleNetwork={() => setNetwork((prev) => (prev === 'mainnet' ? 'testnet' : 'mainnet'))}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'invoices' && (
          <InvoiceList
            invoices={invoices}
            activeStore={activeStore}
            onSelectInvoice={handleOpenCheckout}
            onOpenCreateModal={() => setShowCreateInvoiceModal(true)}
            onInvoiceUpdated={handleInvoiceUpdated}
          />
        )}

        {activeTab === 'pos' && (
          <PointOfSale
            activeStore={activeStore}
            onInvoiceCreated={handleInvoiceCreated}
          />
        )}

        {activeTab === 'wallets' && (
          <WalletNodeView activeStore={activeStore} />
        )}

        {activeTab === 'payment-requests' && (
          <PaymentRequestsView activeStore={activeStore} />
        )}

        {activeTab === 'api-webhooks' && (
          <WebhooksApiView activeStore={activeStore} />
        )}

        {activeTab === 'reports' && (
          <ReportsView activeStore={activeStore} invoices={invoices} />
        )}

        {activeTab === 'settings' && (
          <StoreSettingsView
            activeStore={activeStore}
            onStoreUpdated={handleStoreUpdated}
          />
        )}
      </main>

      {/* Node Telemetry Footer */}
      <footer className="border-t border-white/10 mt-auto bg-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row justify-between items-center text-[10px] font-mono tracking-widest text-white/40 uppercase gap-3">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <span className="flex items-center gap-1.5 text-white/60">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
              BLOCK: <span className="text-white font-bold">832,491</span>
            </span>
            <span>DIFFICULTY: <span className="text-white font-bold">80.67T</span></span>
            <span>MEMPOOL: <span className="text-white font-bold">42,103 TX</span></span>
            <span className="hidden md:inline">NETWORK: <span className="text-orange-400 font-bold">{network.toUpperCase()}</span></span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/60 font-semibold">v2.1.0-PRODUCTION</span>
            <span>© 2026 BTCPAY OPEN PROTOCOL</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showCheckoutModal && selectedInvoice && (
        <BTCPayCheckoutModal
          invoice={selectedInvoice}
          isOpen={showCheckoutModal}
          onClose={() => setShowCheckoutModal(false)}
          onInvoiceUpdated={handleInvoiceUpdated}
        />
      )}

      {showCreateInvoiceModal && (
        <CreateInvoiceModal
          isOpen={showCreateInvoiceModal}
          activeStore={activeStore}
          onClose={() => setShowCreateInvoiceModal(false)}
          onInvoiceCreated={handleInvoiceCreated}
        />
      )}

      {showCreateStoreModal && (
        <CreateStoreModal
          isOpen={showCreateStoreModal}
          onClose={() => setShowCreateStoreModal(false)}
          onStoreCreated={handleStoreCreated}
        />
      )}
    </div>
  );
}
