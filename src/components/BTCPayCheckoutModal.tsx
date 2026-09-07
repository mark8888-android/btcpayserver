import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import {
  X,
  Copy,
  Check,
  Zap,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  QrCode,
  ArrowRight,
  Download,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Invoice, CryptoCurrency } from '../types/btcpay';
import { BTCPayStorageService } from '../services/storage';
import { formatCryptoAmount, formatFiat, convertFiatToCrypto, BASE_RATES } from '../services/rates';

interface CheckoutModalProps {
  invoice: Invoice;
  isOpen: boolean;
  onClose: () => void;
  onInvoiceUpdated: (updated: Invoice) => void;
}

export const BTCPayCheckoutModal: React.FC<CheckoutModalProps> = ({
  invoice,
  isOpen,
  onClose,
  onInvoiceUpdated,
}) => {
  const [activeMethod, setActiveMethod] = useState<CryptoCurrency>(invoice.cryptoCurrency || 'BTC-LN');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(900); // 15 mins default
  const [isSimulating, setIsSimulating] = useState(false);

  // Recalculate crypto amount if method switched
  const currentCrypto = convertFiatToCrypto(invoice.amount, invoice.currency, activeMethod);

  // Calculate remaining timer
  useEffect(() => {
    if (!isOpen) return;
    const expiresMs = new Date(invoice.expiresAt).getTime();
    const interval = setInterval(() => {
      const diffSec = Math.max(0, Math.floor((expiresMs - Date.now()) / 1000));
      setSecondsRemaining(diffSec);
      if (diffSec <= 0 && invoice.status === 'New') {
        const updated = BTCPayStorageService.updateInvoiceStatus(invoice.id, 'Expired');
        if (updated) onInvoiceUpdated(updated);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, invoice, onInvoiceUpdated]);

  // Launch confetti on settled
  useEffect(() => {
    if (invoice.status === 'Settled') {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#3b82f6', '#f59e0b'],
        });
      } catch {
        // Safe fallback
      }
    }
  }, [invoice.status]);

  if (!isOpen) return null;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Payment URIs
  const paymentAddress = invoice.paymentAddress;
  const lightningUri = invoice.lightningInvoice ? `lightning:${invoice.lightningInvoice}` : `lightning:lnbc...`;
  const onChainUri = `bitcoin:${paymentAddress}?amount=${currentCrypto.cryptoAmount}`;
  const displayUri = activeMethod === 'BTC-LN' ? lightningUri : onChainUri;
  const displayQrPayload = activeMethod === 'BTC-LN' ? (invoice.lightningInvoice || displayUri) : displayUri;

  // Simulator actions
  const handleSimulatePayment = (mode: 'instant_lightning' | 'onchain_broadcast' | 'expire') => {
    setIsSimulating(true);

    if (mode === 'instant_lightning') {
      // Instant settlement for Lightning
      setTimeout(() => {
        const updated = BTCPayStorageService.updateInvoiceStatus(
          invoice.id,
          'Settled',
          'ln-htlc-' + Math.random().toString(36).substring(2, 12)
        );
        if (updated) onInvoiceUpdated(updated);
        setIsSimulating(false);
      }, 700);
    } else if (mode === 'onchain_broadcast') {
      // Transition to processing (mempool), then settle after 2.5s
      const updated = BTCPayStorageService.updateInvoiceStatus(
        invoice.id,
        'Processing',
        '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
      );
      if (updated) onInvoiceUpdated(updated);

      setTimeout(() => {
        const settled = BTCPayStorageService.updateInvoiceStatus(invoice.id, 'Settled');
        if (settled) onInvoiceUpdated(settled);
        setIsSimulating(false);
      }, 2500);
    } else if (mode === 'expire') {
      const expired = BTCPayStorageService.updateInvoiceStatus(invoice.id, 'Expired');
      if (expired) onInvoiceUpdated(expired);
      setIsSimulating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0A0A0A] border border-white/20 shadow-2xl overflow-hidden text-white my-8 font-sans">
        {/* Header with store branding & close */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <Zap className="w-4 h-4 fill-orange-400/30" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-tight font-mono leading-tight">BTCPay Checkout</h3>
              <p className="text-[10px] font-mono tracking-wider text-white/40 uppercase">{invoice.orderId} · {invoice.itemDesc}</p>
            </div>
          </div>
          <button
            id="close-checkout-modal-btn"
            onClick={onClose}
            className="p-1.5 text-white/40 hover:text-white border border-transparent hover:border-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Bar */}
        <div className="px-6 py-3 bg-white/[0.03] border-b border-white/10 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            {invoice.status === 'New' && (
              <span className="flex items-center gap-1.5 text-yellow-400 font-bold uppercase tracking-wider text-[11px]">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping"></span>
                Awaiting Payment
              </span>
            )}
            {invoice.status === 'Processing' && (
              <span className="flex items-center gap-1.5 text-blue-400 font-bold uppercase tracking-wider text-[11px]">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Detected in Mempool (0/1 Confs)
              </span>
            )}
            {invoice.status === 'Settled' && (
              <span className="flex items-center gap-1.5 text-green-400 font-bold uppercase tracking-wider text-[11px]">
                <ShieldCheck className="w-4 h-4" />
                Invoice Settled & Paid
              </span>
            )}
            {invoice.status === 'Expired' && (
              <span className="flex items-center gap-1.5 text-rose-400 font-bold uppercase tracking-wider text-[11px]">
                <AlertCircle className="w-3.5 h-3.5" />
                Invoice Expired
              </span>
            )}
          </div>

          {invoice.status === 'New' && (
            <div className="flex items-center gap-1.5 text-white/50 font-mono text-[11px] uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-white/40" />
              <span>Expires in: <strong className="text-white">{timeFormatted}</strong></span>
            </div>
          )}
        </div>

        {/* Invoice Summary Box */}
        <div className="p-6">
          {invoice.status === 'Settled' ? (
            /* Settlement Success View */
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 bg-green-500/20 border border-green-500/40 text-green-400 mx-auto flex items-center justify-center">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <div>
                <h4 className="text-2xl font-black text-white uppercase tracking-tight font-mono">Payment Received!</h4>
                <p className="text-xs text-white/50 mt-1 uppercase font-mono tracking-wider">
                  The merchant node has cryptographically confirmed your payment.
                </p>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 text-left text-xs space-y-2.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-white/40 uppercase tracking-wider">Total Paid:</span>
                  <span className="text-white font-bold">
                    {formatFiat(invoice.amount, invoice.currency)} ({formatCryptoAmount(invoice.cryptoAmount, invoice.cryptoCurrency)})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40 uppercase tracking-wider">Proof:</span>
                  <span className="text-orange-400 truncate max-w-[200px]">{invoice.txHash || 'Verified on Network'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40 uppercase tracking-wider">Confirmed At:</span>
                  <span className="text-white">{invoice.paidAt ? new Date(invoice.paidAt).toLocaleTimeString() : 'Just now'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40 uppercase tracking-wider">Invoice ID:</span>
                  <span className="text-white/70">{invoice.id}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-400 text-black font-black uppercase text-xs tracking-tight transition-all cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : invoice.status === 'Expired' ? (
            /* Expired View */
            <div className="text-center py-6 space-y-4 font-mono">
              <div className="w-14 h-14 bg-rose-500/20 border border-rose-500/40 text-rose-400 mx-auto flex items-center justify-center">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-xl font-black text-white uppercase tracking-tight">Invoice Expired</h4>
                <p className="text-xs text-white/40 mt-1 uppercase tracking-wider">
                  Payment window timed out. Please generate a new invoice.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2.5 border border-white/20 text-white font-bold uppercase tracking-wider text-xs hover:bg-white hover:text-black transition-colors"
              >
                Close Window
              </button>
            </div>
          ) : (
            /* Active Checkout Interface */
            <div className="space-y-6">
              {/* Payment Method Tabs */}
              <div className="flex bg-white/5 p-1 border border-white/10 font-mono text-xs">
                <button
                  id="checkout-tab-lightning"
                  onClick={() => setActiveMethod('BTC-LN')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 uppercase tracking-wider transition-all ${
                    activeMethod === 'BTC-LN'
                      ? 'bg-orange-500 text-black font-black'
                      : 'text-white/50 hover:text-white font-bold'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  Lightning
                </button>
                <button
                  id="checkout-tab-btc"
                  onClick={() => setActiveMethod('BTC')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 uppercase tracking-wider transition-all ${
                    activeMethod === 'BTC'
                      ? 'bg-orange-500 text-black font-black'
                      : 'text-white/50 hover:text-white font-bold'
                  }`}
                >
                  <span>₿</span>
                  Bitcoin On-Chain
                </button>
                <button
                  id="checkout-tab-usdt"
                  onClick={() => setActiveMethod('USDT')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 uppercase tracking-wider transition-all ${
                    activeMethod === 'USDT'
                      ? 'bg-orange-500 text-black font-black'
                      : 'text-white/50 hover:text-white font-bold'
                  }`}
                >
                  <span>₮</span>
                  USDT
                </button>
              </div>

              {/* Amount Display */}
              <div className="text-center font-mono">
                <div className="text-4xl sm:text-5xl font-black text-white tracking-tighter">
                  {formatCryptoAmount(currentCrypto.cryptoAmount, activeMethod)}
                </div>
                <div className="text-xs text-white/40 mt-1 uppercase tracking-wider">
                  ≈ {formatFiat(invoice.amount, invoice.currency)} · RATE: 1 BTC = ${BASE_RATES.USD.BTC.toLocaleString()}
                </div>
              </div>

              {/* QR Code Canvas */}
              <div className="flex flex-col items-center justify-center">
                <div className="p-4 bg-white border-2 border-orange-500 relative group shadow-2xl">
                  <QRCodeSVG
                    value={displayQrPayload}
                    size={200}
                    level="M"
                    includeMargin={false}
                  />
                  {activeMethod === 'BTC-LN' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-10 h-10 bg-orange-500 border-2 border-black flex items-center justify-center shadow-lg">
                        <Zap className="w-5 h-5 text-black fill-black" />
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-mono tracking-widest text-white/40 mt-3 uppercase flex items-center gap-1.5 font-bold">
                  <QrCode className="w-3.5 h-3.5 text-orange-500" />
                  Scan with your {activeMethod === 'BTC-LN' ? 'Lightning' : 'crypto'} wallet
                </span>
              </div>

              {/* Address / Invoice Copy Input */}
              <div className="space-y-2 font-mono">
                <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 block">
                  {activeMethod === 'BTC-LN' ? 'Lightning Payment Request (BOLT-11)' : 'Destination Address'}
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3.5 py-2.5 bg-white/5 border border-white/20 text-xs text-white/80 truncate select-all">
                    {activeMethod === 'BTC-LN' ? invoice.lightningInvoice || displayUri : paymentAddress}
                  </div>
                  <button
                    id="copy-address-btn"
                    onClick={() =>
                      handleCopy(
                        activeMethod === 'BTC-LN' ? invoice.lightningInvoice || displayUri : paymentAddress,
                        'address'
                      )
                    }
                    className="px-3.5 py-2.5 border border-white/20 hover:bg-white hover:text-black text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    {copiedField === 'address' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedField === 'address' ? 'COPIED' : 'COPY'}</span>
                  </button>
                </div>
              </div>

              {/* Simulator Action Panel */}
              <div className="pt-3 border-t border-white/10 font-mono">
                <div className="flex items-center justify-between text-[10px] text-white/40 mb-2 uppercase tracking-widest">
                  <span className="flex items-center gap-1 text-orange-400 font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    SANDBOX PAYMENT SIMULATOR
                  </span>
                  <span>NO REAL FUNDS REQUIRED</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="sim-instant-lightning-btn"
                    disabled={isSimulating}
                    onClick={() => handleSimulatePayment('instant_lightning')}
                    className="px-3 py-2.5 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-400 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    SIMULATE LIGHTNING
                  </button>
                  <button
                    id="sim-onchain-broadcast-btn"
                    disabled={isSimulating}
                    onClick={() => handleSimulatePayment('onchain_broadcast')}
                    className="px-3 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
                    BROADCAST ON-CHAIN
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-white/[0.02] border-t border-white/10 text-[10px] font-mono text-white/40 uppercase tracking-widest flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
            <span>P2P Direct Node Settlement</span>
          </div>
          <span>Non-Custodial</span>
        </div>
      </div>
    </div>
  );
};
