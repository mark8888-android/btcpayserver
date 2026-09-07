import React, { useState } from 'react';
import { X, Plus, Zap, ArrowRight } from 'lucide-react';
import { Store, Invoice, CryptoCurrency } from '../types/btcpay';
import { BTCPayStorageService } from '../services/storage';
import { BASE_RATES, convertFiatToCrypto, formatCryptoAmount } from '../services/rates';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  activeStore: Store;
  onClose: () => void;
  onInvoiceCreated: (invoice: Invoice) => void;
}

export const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({
  isOpen,
  activeStore,
  onClose,
  onInvoiceCreated,
}) => {
  const [amount, setAmount] = useState('25.00');
  const [currency, setCurrency] = useState(activeStore.defaultCurrency || 'USD');
  const [cryptoCurrency, setCryptoCurrency] = useState<CryptoCurrency>('BTC-LN');
  const [itemDesc, setItemDesc] = useState('');
  const [orderId, setOrderId] = useState(`ORD-${Math.floor(1000 + Math.random() * 9000)}`);
  const [buyerEmail, setBuyerEmail] = useState('');

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;
  const converted = convertFiatToCrypto(numAmount, currency, cryptoCurrency);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0) return;

    const newInvoice = BTCPayStorageService.createInvoice({
      storeId: activeStore.id,
      amount: numAmount,
      currency,
      cryptoCurrency,
      itemDesc: itemDesc || `Invoice ${orderId}`,
      orderId,
      buyerEmail: buyerEmail || undefined,
    });

    onInvoiceCreated(newInvoice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#0A0A0A] border border-white/20 shadow-2xl p-6 space-y-5 text-white font-mono">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center">
              <Zap className="w-4 h-4 fill-orange-400/30" />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-tight">Create Payment Invoice</h3>
          </div>
          <button
            id="close-create-invoice-modal"
            onClick={onClose}
            className="p-1 text-white/40 hover:text-white border border-transparent hover:border-white/20 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-1.5">Amount</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white font-mono text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-1.5">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-[#0A0A0A] border border-white/20 text-white font-mono text-sm focus:outline-none focus:border-orange-500 uppercase"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD (CA$)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-1.5">Settlement Protocol</label>
            <select
              value={cryptoCurrency}
              onChange={(e) => setCryptoCurrency(e.target.value as CryptoCurrency)}
              className="w-full px-3 py-2 bg-[#0A0A0A] border border-white/20 text-white text-xs focus:outline-none focus:border-orange-500 uppercase font-mono"
            >
              <option value="BTC-LN">⚡ Bitcoin Lightning Network (Instant, Low Fees)</option>
              <option value="BTC">₿ Bitcoin On-Chain (Direct L1 cold storage)</option>
              <option value="USDT">₮ Tether USD (USDT - Stablecoin)</option>
              <option value="ETH">Ξ Ethereum (ETH)</option>
            </select>
            <div className="mt-1 text-[10px] text-orange-400 font-mono uppercase tracking-wider font-bold">
              ESTIMATED: {formatCryptoAmount(converted.cryptoAmount, cryptoCurrency)} · RATE: ${converted.rate.toLocaleString()}
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-1.5">Order ID</label>
            <input
              type="text"
              required
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white font-mono focus:outline-none focus:border-orange-500 uppercase"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-1.5">Item Description</label>
            <input
              type="text"
              placeholder="e.g. Satoshi Blend Coffee 5lb Bag"
              value={itemDesc}
              onChange={(e) => setItemDesc(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white focus:outline-none focus:border-orange-500 font-sans"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-1.5">Buyer Email (Optional)</label>
            <input
              type="email"
              placeholder="customer@domain.com"
              value={buyerEmail}
              onChange={(e) => setBuyerEmail(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white focus:outline-none focus:border-orange-500 font-sans"
            />
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
              id="submit-create-invoice-btn"
              type="submit"
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-black font-black uppercase text-xs tracking-tight flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Create Invoice & View QR</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
