import React, { useState } from 'react';
import { X, Store as StoreIcon, Plus } from 'lucide-react';
import { Store, SpeedPolicy } from '../types/btcpay';
import { BTCPayStorageService } from '../services/storage';

interface CreateStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoreCreated: (newStore: Store) => void;
}

export const CreateStoreModal: React.FC<CreateStoreModalProps> = ({
  isOpen,
  onClose,
  onStoreCreated,
}) => {
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [defaultCurrency, setDefaultCurrency] = useState('USD');
  const [speedPolicy, setSpeedPolicy] = useState<SpeedPolicy>('HighSpeed');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const id = `store_${Date.now().toString(36)}`;
    const newStore: Store = {
      id,
      name: name.trim(),
      website: website.trim() || 'https://merchant.example',
      defaultCurrency,
      speedPolicy,
      invoiceExpirationMinutes: 15,
      monitoringMinutes: 1440,
      lightningEnabled: true,
      onChainEnabled: true,
      stablecoinsEnabled: true,
      exchangeRateProvider: 'CoinGecko',
      theme: 'light',
    };

    BTCPayStorageService.saveStore(newStore);
    BTCPayStorageService.setActiveStore(newStore.id);
    onStoreCreated(newStore);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#0A0A0A] border border-white/20 shadow-2xl p-6 space-y-5 text-white font-mono">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <StoreIcon className="w-5 h-5 text-orange-500" />
            <h3 className="text-sm font-black text-white uppercase tracking-tight">Create Merchant Store</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/40 hover:text-white border border-transparent hover:border-white/20 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-1.5">Store Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Blockstream Merch Shop"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white focus:outline-none focus:border-orange-500 font-sans"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-1.5">Merchant Website</label>
            <input
              type="url"
              placeholder="https://myshop.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white focus:outline-none focus:border-orange-500 font-sans"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-1.5">Default Currency</label>
              <select
                value={defaultCurrency}
                onChange={(e) => setDefaultCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-[#0A0A0A] border border-white/20 text-white focus:outline-none focus:border-orange-500 uppercase"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD (CA$)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-1.5">Speed Policy</label>
              <select
                value={speedPolicy}
                onChange={(e) => setSpeedPolicy(e.target.value as SpeedPolicy)}
                className="w-full px-3 py-2 bg-[#0A0A0A] border border-white/20 text-white focus:outline-none focus:border-orange-500 uppercase font-mono text-[11px]"
              >
                <option value="HighSpeed">⚡ 0-conf (Instant)</option>
                <option value="MediumSpeed">🔒 1 Confirmation</option>
                <option value="IsFullyConfirmed">🛡️ 6 Confirmations</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-white/20 text-white hover:bg-white hover:text-black uppercase text-xs tracking-wider font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-black font-black uppercase text-xs tracking-tight transition-all cursor-pointer"
            >
              Create Store
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
