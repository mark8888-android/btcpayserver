import React, { useState } from 'react';
import {
  Settings,
  Store as StoreIcon,
  Shield,
  Zap,
  Clock,
  Coins,
  Check,
  Globe,
  Sliders,
  Copy,
} from 'lucide-react';
import { Store, SpeedPolicy } from '../types/btcpay';
import { BTCPayStorageService } from '../services/storage';

interface StoreSettingsViewProps {
  activeStore: Store;
  onStoreUpdated: (updatedStore: Store) => void;
}

export const StoreSettingsView: React.FC<StoreSettingsViewProps> = ({
  activeStore,
  onStoreUpdated,
}) => {
  const [name, setName] = useState(activeStore.name);
  const [website, setWebsite] = useState(activeStore.website);
  const [defaultCurrency, setDefaultCurrency] = useState(activeStore.defaultCurrency);
  const [speedPolicy, setSpeedPolicy] = useState<SpeedPolicy>(activeStore.speedPolicy);
  const [paymentAddress, setPaymentAddress] = useState(
    activeStore.paymentAddress || '1KLpqhwLaKicy9uxnhA1Lr6oPzCC8ZAGkb'
  );
  const [invoiceExpirationMinutes, setInvoiceExpirationMinutes] = useState(
    activeStore.invoiceExpirationMinutes || 15
  );
  const [monitoringMinutes, setMonitoringMinutes] = useState(
    activeStore.monitoringMinutes || 1440
  );
  const [lightningEnabled, setLightningEnabled] = useState(activeStore.lightningEnabled);
  const [onChainEnabled, setOnChainEnabled] = useState(activeStore.onChainEnabled);
  const [stablecoinsEnabled, setStablecoinsEnabled] = useState(activeStore.stablecoinsEnabled);
  const [exchangeRateProvider, setExchangeRateProvider] = useState(
    activeStore.exchangeRateProvider || 'CoinGecko'
  );
  const [savedToast, setSavedToast] = useState(false);
  const [copiedAddr, setCopiedAddr] = useState(false);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(paymentAddress);
    setCopiedAddr(true);
    setTimeout(() => setCopiedAddr(false), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Store = {
      ...activeStore,
      name,
      website,
      defaultCurrency,
      speedPolicy,
      paymentAddress,
      invoiceExpirationMinutes: Number(invoiceExpirationMinutes),
      monitoringMinutes: Number(monitoringMinutes),
      lightningEnabled,
      onChainEnabled,
      stablecoinsEnabled,
      exchangeRateProvider,
    };

    BTCPayStorageService.saveStore(updated);
    onStoreUpdated(updated);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.03] border border-white/10 p-6 font-mono">
        <div>
          <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
            <StoreIcon className="w-5 h-5 text-orange-500" />
            Store Settings: {activeStore.name}
          </h3>
          <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">
            Configure settlement speed, supported cryptocurrencies, and invoice timing
          </p>
        </div>
        {savedToast && (
          <div className="px-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 animate-bounce">
            <Check className="w-3.5 h-3.5" />
            SETTINGS SAVED!
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Info */}
        <div className="bg-white/[0.03] border border-white/10 p-6 space-y-4 font-mono">
          <h4 className="text-xs font-black uppercase tracking-widest text-orange-400">
            Store Profile & Currency
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1.5">Store Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white focus:outline-none focus:border-orange-500 font-sans"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1.5">Merchant Website</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white focus:outline-none focus:border-orange-500 font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1.5">Default Pricing Currency</label>
              <select
                value={defaultCurrency}
                onChange={(e) => setDefaultCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-black border border-white/20 text-white focus:outline-none focus:border-orange-500 font-mono text-xs"
              >
                <option value="USD">USD ($ United States Dollar)</option>
                <option value="EUR">EUR (€ Euro)</option>
                <option value="GBP">GBP (£ British Pound)</option>
                <option value="CAD">CAD (CA$ Canadian Dollar)</option>
                <option value="AUD">AUD (AU$ Australian Dollar)</option>
                <option value="JPY">JPY (¥ Japanese Yen)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1.5">Exchange Rates Source</label>
              <select
                value={exchangeRateProvider}
                onChange={(e) => setExchangeRateProvider(e.target.value)}
                className="w-full px-3 py-2 bg-black border border-white/20 text-white focus:outline-none focus:border-orange-500 font-mono text-xs"
              >
                <option value="CoinGecko">CoinGecko (Aggregated Global)</option>
                <option value="Kraken">Kraken Exchange Orderbooks</option>
                <option value="Binance">Binance Spot Index</option>
                <option value="Coinbase">Coinbase Pro API</option>
              </select>
            </div>
          </div>
        </div>

        {/* Speed Policy & Confirmation Settings */}
        <div className="bg-white/[0.03] border border-white/10 p-6 space-y-4 font-mono">
          <h4 className="text-xs font-black uppercase tracking-widest text-orange-400">
            Payment Settlement Speed Policy
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div
              onClick={() => setSpeedPolicy('HighSpeed')}
              className={`p-4 border cursor-pointer transition-all ${
                speedPolicy === 'HighSpeed'
                  ? 'bg-orange-500/10 border-orange-500 text-white'
                  : 'bg-black border-white/20 text-white/60 hover:border-white/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs uppercase tracking-tight text-white">⚡ High Speed</span>
                {speedPolicy === 'HighSpeed' && <Check className="w-4 h-4 text-orange-400" />}
              </div>
              <p className="text-[11px] text-white/60 leading-relaxed">
                Consider settled at 0-conf unconfirmed transaction. Instant for coffee & POS.
              </p>
            </div>

            <div
              onClick={() => setSpeedPolicy('MediumSpeed')}
              className={`p-4 border cursor-pointer transition-all ${
                speedPolicy === 'MediumSpeed'
                  ? 'bg-orange-500/10 border-orange-500 text-white'
                  : 'bg-black border-white/20 text-white/60 hover:border-white/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs uppercase tracking-tight text-white">🔒 Medium Speed</span>
                {speedPolicy === 'MediumSpeed' && <Check className="w-4 h-4 text-orange-400" />}
              </div>
              <p className="text-[11px] text-white/60 leading-relaxed">
                Requires at least 1 on-chain block confirmation (~10 mins). Standard e-commerce.
              </p>
            </div>

            <div
              onClick={() => setSpeedPolicy('IsFullyConfirmed')}
              className={`p-4 border cursor-pointer transition-all ${
                speedPolicy === 'IsFullyConfirmed'
                  ? 'bg-orange-500/10 border-orange-500 text-white'
                  : 'bg-black border-white/20 text-white/60 hover:border-white/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs uppercase tracking-tight text-white">🛡️ Maximum Security</span>
                {speedPolicy === 'IsFullyConfirmed' && <Check className="w-4 h-4 text-orange-400" />}
              </div>
              <p className="text-[11px] text-white/60 leading-relaxed">
                Requires 6 confirmations (~60 mins). Ideal for high-value merchandise.
              </p>
            </div>
          </div>
        </div>

        {/* Supported Payment Methods */}
        <div className="bg-white/[0.03] border border-white/10 p-6 space-y-4 font-mono">
          <h4 className="text-xs font-black uppercase tracking-widest text-orange-400">
            Enabled Payment Methods
          </h4>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 bg-black border border-white/20 cursor-pointer hover:border-white/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                  ⚡
                </div>
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-tight">Bitcoin Lightning Network (BTC-LN)</div>
                  <div className="text-[10px] text-white/40 uppercase tracking-wider">Instant micro-payments, sub-cent routing fees</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={lightningEnabled}
                onChange={(e) => setLightningEnabled(e.target.checked)}
                className="w-4 h-4 rounded-none text-orange-500 focus:ring-orange-500 bg-black border-white/20"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-black border border-white/20 cursor-pointer hover:border-white/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                  ₿
                </div>
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-tight">Bitcoin On-Chain (BTC)</div>
                  <div className="text-[10px] text-white/40 uppercase tracking-wider">Direct layer-1 settlement into merchant cold storage</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={onChainEnabled}
                onChange={(e) => setOnChainEnabled(e.target.checked)}
                className="w-4 h-4 rounded-none text-orange-500 focus:ring-orange-500 bg-black border-white/20"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-black border border-white/20 cursor-pointer hover:border-white/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500/20 text-green-400 flex items-center justify-center font-bold">
                  ₮
                </div>
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-tight">Tether USD & USD Coin (USDT / USDC)</div>
                  <div className="text-[10px] text-white/40 uppercase tracking-wider">Stablecoins on Ethereum / Arbitrum / Polygon</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={stablecoinsEnabled}
                onChange={(e) => setStablecoinsEnabled(e.target.checked)}
                className="w-4 h-4 rounded-none text-orange-500 focus:ring-orange-500 bg-black border-white/20"
              />
            </label>
          </div>
        </div>

        {/* Admin Bitcoin Payment Address */}
        <div className="bg-white/[0.03] border border-white/10 p-6 space-y-4 font-mono">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-widest text-orange-400 flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
              Admin Bitcoin Payment Address (On-Chain Settlement)
            </h4>
            <span className="text-[10px] font-bold text-green-400 border border-green-500/30 bg-green-500/10 px-2 py-0.5 uppercase tracking-wider">
              Active Wallet Target
            </span>
          </div>

          <div>
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1.5">
              Bitcoin Settlement Address (P2PKH / SegWit)
            </label>
            <div className="flex items-center gap-2">
              <input
                id="admin-bitcoin-payment-address-input"
                type="text"
                required
                value={paymentAddress}
                onChange={(e) => setPaymentAddress(e.target.value)}
                className="flex-1 px-3.5 py-2.5 bg-black border border-white/20 text-white font-mono text-xs focus:outline-none focus:border-orange-500 font-bold select-all"
                placeholder="1KLpqhwLaKicy9uxnhA1Lr6oPzCC8ZAGkb"
              />
              <button
                type="button"
                id="copy-admin-bitcoin-address-btn"
                onClick={handleCopyAddress}
                className="px-4 py-2.5 bg-white/10 hover:bg-white hover:text-black border border-white/20 text-white text-xs font-mono font-bold uppercase transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                {copiedAddr ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedAddr ? 'COPIED' : 'COPY'}
              </button>
            </div>
            <p className="text-[10px] text-white/40 uppercase tracking-wider mt-2">
              All on-chain Bitcoin customer invoices and merchant payouts will route and settle directly into this Bitcoin address.
            </p>
          </div>
        </div>

        {/* Invoice Expiration */}
        <div className="bg-white/[0.03] border border-white/10 p-6 space-y-4 font-mono">
          <h4 className="text-xs font-black uppercase tracking-widest text-orange-400">
            Invoice Timing & Expiry
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1.5">Invoice Expiration (Minutes)</label>
              <input
                type="number"
                min={1}
                max={120}
                value={invoiceExpirationMinutes}
                onChange={(e) => setInvoiceExpirationMinutes(parseInt(e.target.value) || 15)}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white font-mono"
              />
              <p className="text-[10px] text-white/30 uppercase tracking-wider mt-1.5">
                How long exchange rate lock stays valid on checkout QR
              </p>
            </div>

            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1.5">Mempool Monitoring Window (Minutes)</label>
              <input
                type="number"
                min={60}
                max={10080}
                value={monitoringMinutes}
                onChange={(e) => setMonitoringMinutes(parseInt(e.target.value) || 1440)}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white font-mono"
              />
              <p className="text-[10px] text-white/30 uppercase tracking-wider mt-1.5">
                Time BTCPay will continue to watch for delayed on-chain transactions
              </p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end font-mono">
          <button
            id="save-store-settings-btn"
            type="submit"
            className="px-6 py-3 bg-orange-500 hover:bg-orange-400 text-black text-xs font-black uppercase tracking-tight transition-all cursor-pointer"
          >
            Save All Store Settings
          </button>
        </div>
      </form>
    </div>
  );
};
