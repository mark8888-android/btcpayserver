import React, { useState } from 'react';
import {
  Send,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  Plus,
  Copy,
  Check,
  ExternalLink,
  DollarSign,
  Zap,
  Filter,
} from 'lucide-react';
import { Store, PaymentRequest, Payout, CryptoCurrency } from '../types/btcpay';
import { BTCPayStorageService } from '../services/storage';
import { formatFiat, BASE_RATES } from '../services/rates';

interface PaymentRequestsViewProps {
  activeStore: Store;
}

export const PaymentRequestsView: React.FC<PaymentRequestsViewProps> = ({ activeStore }) => {
  const [subTab, setSubTab] = useState<'requests' | 'payouts'>('requests');
  const [requests, setRequests] = useState<PaymentRequest[]>(() =>
    BTCPayStorageService.getPaymentRequests(activeStore.id)
  );
  const [payouts, setPayouts] = useState<Payout[]>(() =>
    BTCPayStorageService.getPayouts(activeStore.id)
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Request modal
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [reqTitle, setReqTitle] = useState('');
  const [reqEmail, setReqEmail] = useState('');
  const [reqAmount, setReqAmount] = useState('');
  const [reqDueDate, setReqDueDate] = useState('2026-10-01');
  const [reqNotes, setReqNotes] = useState('');

  // New Payout modal
  const [showNewPayoutModal, setShowNewPayoutModal] = useState(false);
  const [payoutAddress, setPayoutAddress] = useState('');
  const [payoutCrypto, setPayoutCrypto] = useState<CryptoCurrency>('BTC');
  const [payoutAmountCrypto, setPayoutAmountCrypto] = useState('');
  const [payoutNote, setPayoutNote] = useState('');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(reqAmount);
    if (!reqTitle || !reqEmail || isNaN(amountNum) || amountNum <= 0) return;

    const created = BTCPayStorageService.createPaymentRequest({
      storeId: activeStore.id,
      title: reqTitle,
      customerEmail: reqEmail,
      amount: amountNum,
      currency: activeStore.defaultCurrency,
      dueDate: reqDueDate,
      notes: reqNotes,
    });

    setRequests(BTCPayStorageService.getPaymentRequests(activeStore.id));
    setShowNewRequestModal(false);
    setReqTitle('');
    setReqEmail('');
    setReqAmount('');
    setReqNotes('');
  };

  const handleCreatePayout = (e: React.FormEvent) => {
    e.preventDefault();
    const amtNum = parseFloat(payoutAmountCrypto);
    if (!payoutAddress || isNaN(amtNum) || amtNum <= 0) return;

    const fiatEquiv = amtNum * (payoutCrypto.includes('BTC') ? BASE_RATES.USD.BTC : 1.0);

    BTCPayStorageService.createPayout({
      storeId: activeStore.id,
      destinationAddress: payoutAddress,
      cryptoCurrency: payoutCrypto,
      amountCrypto: amtNum,
      amountFiat: Number(fiatEquiv.toFixed(2)),
      fiatCurrency: activeStore.defaultCurrency,
      recipientNote: payoutNote,
    });

    setPayouts(BTCPayStorageService.getPayouts(activeStore.id));
    setShowNewPayoutModal(false);
    setPayoutAddress('');
    setPayoutAmountCrypto('');
    setPayoutNote('');
  };

  const handleApprovePayout = (payoutId: string) => {
    BTCPayStorageService.updatePayoutStatus(
      payoutId,
      'Completed',
      'tx_' + Math.random().toString(36).substring(2, 10)
    );
    setPayouts(BTCPayStorageService.getPayouts(activeStore.id));
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation bar */}
      <div className="flex items-center justify-between bg-white/[0.03] border border-white/10 p-2 font-mono">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab('requests')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-tight transition-all cursor-pointer ${
              subTab === 'requests'
                ? 'bg-orange-500 text-black'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Payment Requests</span>
          </button>
          <button
            onClick={() => setSubTab('payouts')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-tight transition-all cursor-pointer ${
              subTab === 'payouts'
                ? 'bg-orange-500 text-black'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Payouts & Pull Payments</span>
          </button>
        </div>

        {subTab === 'requests' ? (
          <button
            id="create-payment-request-btn"
            onClick={() => setShowNewRequestModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-black text-xs font-black uppercase tracking-tight transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            New Payment Request
          </button>
        ) : (
          <button
            id="create-payout-btn"
            onClick={() => setShowNewPayoutModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-black text-xs font-black uppercase tracking-tight transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Payout
          </button>
        )}
      </div>

      {subTab === 'requests' ? (
        /* PAYMENT REQUESTS LIST */
        <div className="bg-white/[0.03] border border-white/10 overflow-hidden font-mono">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white">
              <thead className="bg-black/60 text-[10px] uppercase tracking-widest text-white/40 border-b border-white/10">
                <tr>
                  <th className="px-5 py-3.5">Title & Reference</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Total / Paid</th>
                  <th className="px-5 py-3.5">Payment Progress</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Due Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-white/40 text-xs font-mono uppercase tracking-widest">
                      No payment requests created yet.
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => {
                    const percent = Math.min(100, Math.round((req.paidAmount / req.amount) * 100));
                    return (
                      <tr key={req.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-white uppercase tracking-tight">{req.title}</div>
                          <div className="text-[10px] text-white/40 font-mono">{req.id}</div>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-white/70 font-sans">{req.customerEmail}</td>
                        <td className="px-5 py-3.5 font-mono">
                          <div className="font-black text-white">{formatFiat(req.amount, req.currency)}</div>
                          <div className="text-[11px] text-orange-400">PAID: {formatFiat(req.paidAmount, req.currency)}</div>
                        </td>
                        <td className="px-5 py-3.5 w-40">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-mono text-white/40 uppercase tracking-widest">
                              <span>{percent}%</span>
                              <span>
                                {formatFiat(req.amount - req.paidAmount, req.currency)} due
                              </span>
                            </div>
                            <div className="h-2 bg-black border border-white/20 overflow-hidden">
                              <div
                                style={{ width: `${percent}%` }}
                                className="bg-orange-500 h-full transition-all"
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              req.status === 'Completed'
                                ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                                : req.status === 'Partial'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                                : 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
                            }`}
                          >
                            {req.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-white/50 font-mono">{req.dueDate}</td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => handleCopy(`https://btcpay.example/requests/${req.id}`, req.id)}
                            className="px-3 py-1.5 border border-white/20 hover:bg-white hover:text-black text-white text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            {copiedId === req.id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>Share Link</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* PAYOUTS LIST */
        <div className="bg-white/[0.03] border border-white/10 overflow-hidden font-mono">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white">
              <thead className="bg-black/60 text-[10px] uppercase tracking-widest text-white/40 border-b border-white/10">
                <tr>
                  <th className="px-5 py-3.5">Payout ID / Note</th>
                  <th className="px-5 py-3.5">Destination Address</th>
                  <th className="px-5 py-3.5">Crypto Amount</th>
                  <th className="px-5 py-3.5">Fiat Value</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Created</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {payouts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-white/40 text-xs font-mono uppercase tracking-widest">
                      No payouts scheduled.
                    </td>
                  </tr>
                ) : (
                  payouts.map((po) => (
                    <tr key={po.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-white font-mono">{po.id}</div>
                        <div className="text-[11px] text-white/40">{po.recipientNote || 'No notes'}</div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-white/70 truncate max-w-[180px]">
                        {po.destinationAddress}
                      </td>
                      <td className="px-5 py-3.5 font-mono font-black text-orange-400">
                        {po.amountCrypto} {po.cryptoCurrency}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-white">
                        {formatFiat(po.amountFiat, po.fiatCurrency)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            po.status === 'Completed'
                              ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                              : 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
                          }`}
                        >
                          {po.status === 'AwaitingApproval' ? 'Awaiting Approval' : po.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-white/40 font-mono">
                        {new Date(po.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {po.status === 'AwaitingApproval' && (
                          <button
                            onClick={() => handleApprovePayout(po.id)}
                            className="px-3 py-1.5 bg-orange-500 hover:bg-orange-400 text-black text-xs font-black uppercase tracking-tight transition-colors cursor-pointer"
                          >
                            Approve & Broadcast
                          </button>
                        )}
                        {po.status === 'Completed' && (
                          <span className="text-xs text-green-400 font-mono font-bold">Sent ({po.txId})</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Payment Request Modal */}
      {showNewRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0A0A0A] border border-white/20 p-6 shadow-2xl space-y-5 text-white font-mono">
            <h3 className="text-sm font-black text-white uppercase tracking-tight">Create Payment Request</h3>
            <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-1.5">Title / Project Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 Website Development Retainer"
                  value={reqTitle}
                  onChange={(e) => setReqTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white focus:outline-none focus:border-orange-500 font-sans"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-1.5">Customer Email</label>
                <input
                  type="email"
                  required
                  placeholder="client@acme.example"
                  value={reqEmail}
                  onChange={(e) => setReqEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white focus:outline-none focus:border-orange-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-1.5">Amount ({activeStore.defaultCurrency})</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="1500.00"
                    value={reqAmount}
                    onChange={(e) => setReqAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-1.5">Due Date</label>
                  <input
                    type="date"
                    value={reqDueDate}
                    onChange={(e) => setReqDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-1.5">Payment Instructions / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Allows partial crypto payments. Net 30 terms."
                  value={reqNotes}
                  onChange={(e) => setReqNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white focus:outline-none focus:border-orange-500 font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewRequestModal(false)}
                  className="px-4 py-2.5 border border-white/20 text-white hover:bg-white hover:text-black uppercase text-xs tracking-wider font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-black font-black uppercase text-xs tracking-tight transition-all cursor-pointer"
                >
                  Create Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Payout Modal */}
      {showNewPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0A0A0A] border border-white/20 p-6 shadow-2xl space-y-5 text-white font-mono">
            <h3 className="text-sm font-black text-white uppercase tracking-tight">Create Merchant Payout</h3>
            <form onSubmit={handleCreatePayout} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-1.5">Destination Address / Lightning Invoice</label>
                <input
                  type="text"
                  required
                  placeholder="1KLpq... or bc1q... or 0x... or lnbc..."
                  value={payoutAddress}
                  onChange={(e) => setPayoutAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white font-mono focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-1.5">Asset</label>
                  <select
                    value={payoutCrypto}
                    onChange={(e) => setPayoutCrypto(e.target.value as CryptoCurrency)}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-white/20 text-white focus:outline-none focus:border-orange-500 uppercase"
                  >
                    <option value="BTC">Bitcoin (On-Chain)</option>
                    <option value="BTC-LN">Bitcoin (Lightning)</option>
                    <option value="USDT">USDT (ERC-20)</option>
                    <option value="ETH">Ethereum</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-1.5">Crypto Amount</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    placeholder="0.025"
                    value={payoutAmountCrypto}
                    onChange={(e) => setPayoutAmountCrypto(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-1.5">Reason / Note</label>
                <input
                  type="text"
                  placeholder="e.g. Supplier Invoice #991"
                  value={payoutNote}
                  onChange={(e) => setPayoutNote(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white focus:outline-none focus:border-orange-500 font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewPayoutModal(false)}
                  className="px-4 py-2.5 border border-white/20 text-white hover:bg-white hover:text-black uppercase text-xs tracking-wider font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-black font-black uppercase text-xs tracking-tight transition-all cursor-pointer"
                >
                  Schedule Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
