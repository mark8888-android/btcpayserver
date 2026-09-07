import React, { useState } from 'react';
import {
  Store as StoreIcon,
  Plus,
  Zap,
  TrendingUp,
  Server,
  Receipt,
  ShoppingBag,
  Wallet,
  Send,
  Webhook,
  BarChart3,
  Settings,
  Check,
  ChevronDown,
  Globe,
} from 'lucide-react';
import { Store } from '../types/btcpay';
import { BASE_RATES } from '../services/rates';

interface HeaderProps {
  stores: Store[];
  activeStore: Store;
  onSelectStore: (storeId: string) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenNewInvoice: () => void;
  onOpenCreateStore: () => void;
  network: 'mainnet' | 'testnet';
  onToggleNetwork: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  stores,
  activeStore,
  onSelectStore,
  activeTab,
  onTabChange,
  onOpenNewInvoice,
  onOpenCreateStore,
  network,
  onToggleNetwork,
}) => {
  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);

  const btcPrice = BASE_RATES.USD.BTC;

  const navItems = [
    { id: 'invoices', label: 'Invoices', icon: Receipt },
    { id: 'pos', label: 'Point of Sale', icon: ShoppingBag },
    { id: 'wallets', label: 'Wallets & Node', icon: Wallet },
    { id: 'payment-requests', label: 'Requests & Payouts', icon: Send },
    { id: 'api-webhooks', label: 'Webhooks & API', icon: Webhook },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Store Settings', icon: Settings },
  ];

  return (
    <header className="bg-[#050505] border-b border-white/20 text-[#F8F8F8] sticky top-0 z-30">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between pt-6 pb-4 border-b border-white/10 gap-4">
          {/* Logo & Store Selector */}
          <div className="flex flex-wrap items-center gap-6">
            <div
              className="flex flex-col cursor-pointer select-none"
              onClick={() => onTabChange('invoices')}
            >
              <h1 className="text-3xl sm:text-4xl font-black tracking-tighter leading-none uppercase text-white">
                BTCPay<span className="text-orange-500">.</span>Server
              </h1>
              <p className="text-[10px] font-mono tracking-widest text-white/40 mt-1.5 uppercase">
                Decentralized Payment Infrastructure
              </p>
            </div>

            {/* Store Switcher Dropdown */}
            <div className="relative">
              <button
                id="store-switcher-btn"
                onClick={() => setStoreDropdownOpen(!storeDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/20 text-xs font-mono font-bold text-white uppercase tracking-wider transition-colors"
              >
                <StoreIcon className="w-3.5 h-3.5 text-orange-500" />
                <span className="max-w-[140px] truncate">{activeStore.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-white/40" />
              </button>

              {storeDropdownOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-[#0A0A0A] border border-white/20 shadow-2xl py-2 z-50">
                  <div className="px-3 py-1.5 text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest">
                    Merchant Stores
                  </div>
                  {stores.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        onSelectStore(s.id);
                        setStoreDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-mono flex items-center justify-between hover:bg-white/10 transition-colors"
                    >
                      <div className="truncate">
                        <div className="text-white font-bold truncate">{s.name}</div>
                        <div className="text-[10px] text-white/40 tracking-wider uppercase">
                          {s.defaultCurrency} · {s.speedPolicy}
                        </div>
                      </div>
                      {s.id === activeStore.id && (
                        <Check className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                      )}
                    </button>
                  ))}
                  <div className="border-t border-white/10 my-1 pt-1">
                    <button
                      onClick={() => {
                        setStoreDropdownOpen(false);
                        onOpenCreateStore();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-mono text-orange-400 hover:bg-white/10 flex items-center gap-2 font-bold uppercase tracking-wider"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Create New Store
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side Stats & Actions */}
          <div className="flex items-center gap-4">
            {/* Live Ticker */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-white/50 uppercase tracking-widest text-[10px]">
                BTC/USD:
              </span>
              <span className="text-white font-bold tracking-tight">${btcPrice.toLocaleString()}</span>
              <span className="text-orange-400 font-bold text-[10px]">+3.4%</span>
            </div>

            {/* Network Badge */}
            <button
              id="network-toggle-btn"
              onClick={onToggleNetwork}
              title="Click to toggle Network mode"
              className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/30 text-green-400 text-[10px] font-mono font-bold tracking-widest uppercase transition-all hover:bg-green-500/20"
            >
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span>{network.toUpperCase()} ONLINE</span>
            </button>

            {/* Create Invoice Primary Button */}
            <button
              id="header-create-invoice-btn"
              onClick={onOpenNewInvoice}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 active:scale-95 text-black font-black text-xs uppercase tracking-tight transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>New Invoice</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-6 overflow-x-auto scrollbar-none py-3 text-xs font-bold tracking-widest uppercase font-mono">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => onTabChange(item.id)}
                className={`py-1 transition-all whitespace-nowrap border-b-2 flex items-center gap-1.5 ${
                  isActive
                    ? 'text-orange-500 border-orange-500'
                    : 'text-white/50 border-transparent hover:text-white hover:border-white/30'
                }`}
              >
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
