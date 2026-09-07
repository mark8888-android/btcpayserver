import React, { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  Zap,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  Receipt,
  FileSpreadsheet,
} from 'lucide-react';
import { Invoice, InvoiceStatus, Store } from '../types/btcpay';
import { formatFiat, formatCryptoAmount } from '../services/rates';
import { BTCPayStorageService } from '../services/storage';

interface InvoiceListProps {
  invoices: Invoice[];
  activeStore: Store;
  onSelectInvoice: (invoice: Invoice) => void;
  onOpenCreateModal: () => void;
  onInvoiceUpdated: (updated: Invoice) => void;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({
  invoices,
  activeStore,
  onSelectInvoice,
  onOpenCreateModal,
  onInvoiceUpdated,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Filter invoices
  const filtered = invoices.filter((inv) => {
    const matchesSearch =
      inv.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.buyerEmail && inv.buyerEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      inv.itemDesc.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const totalVolumeFiat = invoices
    .filter((inv) => inv.status === 'Settled')
    .reduce((acc, inv) => acc + inv.amount, 0);

  const settledCount = invoices.filter((inv) => inv.status === 'Settled').length;
  const processingCount = invoices.filter((inv) => inv.status === 'Processing').length;
  const newCount = invoices.filter((inv) => inv.status === 'New').length;

  const handleQuickPay = (e: React.MouseEvent, invoice: Invoice) => {
    e.stopPropagation();
    const updated = BTCPayStorageService.updateInvoiceStatus(
      invoice.id,
      'Settled',
      'ln-quick-' + Math.random().toString(36).substring(2, 8)
    );
    if (updated) onInvoiceUpdated(updated);
  };

  const handleExportCsv = () => {
    const headers = 'Invoice ID,Order ID,Description,Status,Amount,Currency,Crypto Amount,Crypto Currency,Created At,Paid At,TxHash\n';
    const rows = filtered
      .map(
        (inv) =>
          `"${inv.id}","${inv.orderId}","${inv.itemDesc}","${inv.status}",${inv.amount},"${inv.currency}",${inv.cryptoAmount},"${inv.cryptoCurrency}","${inv.createdAt}","${inv.paidAt || ''}","${inv.txHash || ''}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `btcpay_invoices_${activeStore.id}_${Date.now()}.csv`);
    link.click();
  };

  return (
    <div className="space-y-8">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/[0.03] border border-white/10 p-6">
          <label className="text-[10px] font-mono tracking-[0.2em] text-white/40 uppercase block mb-1">
            Settled Volume
          </label>
          <div className="text-3xl sm:text-4xl font-black text-white tracking-tighter font-mono mt-1">
            {formatFiat(totalVolumeFiat, activeStore.defaultCurrency)}
          </div>
          <div className="text-[11px] font-mono text-green-400 mt-2 flex items-center gap-1.5 uppercase tracking-wider font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{settledCount} Settled Payments</span>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/10 p-6">
          <label className="text-[10px] font-mono tracking-[0.2em] text-white/40 uppercase block mb-1">
            Awaiting Payment
          </label>
          <div className="text-3xl sm:text-4xl font-black text-yellow-400 tracking-tighter font-mono mt-1">
            {newCount}
          </div>
          <div className="text-[11px] font-mono text-white/40 mt-2 flex items-center gap-1.5 uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" />
            <span>Active checkout timers</span>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/10 p-6">
          <label className="text-[10px] font-mono tracking-[0.2em] text-white/40 uppercase block mb-1">
            In Mempool / Confirming
          </label>
          <div className="text-3xl sm:text-4xl font-black text-blue-400 tracking-tighter font-mono mt-1">
            {processingCount}
          </div>
          <div className="text-[11px] font-mono text-white/40 mt-2 flex items-center gap-1.5 uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span>0-conf or 1-conf pending</span>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/10 p-6">
          <label className="text-[10px] font-mono tracking-[0.2em] text-white/40 uppercase block mb-1">
            Speed Policy
          </label>
          <div className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase mt-1">
            {activeStore.speedPolicy === 'HighSpeed'
              ? '⚡ High Speed (0-conf)'
              : activeStore.speedPolicy === 'MediumSpeed'
              ? '🔒 1 Confirmation'
              : '🛡️ 6 Confirmations'}
          </div>
          <div className="text-[11px] font-mono text-white/40 mt-2 uppercase tracking-wider">
            Non-custodial direct node
          </div>
        </div>
      </div>

      {/* Action & Filter Bar */}
      <div className="bg-white/[0.02] border border-white/10 p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              id="invoice-search-input"
              type="text"
              placeholder="SEARCH ORDER, EMAIL, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/20 text-xs font-mono text-white placeholder-white/30 uppercase tracking-wider focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Status filter pills & actions */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center bg-white/5 p-1 border border-white/10 font-mono text-xs">
              {['ALL', 'New', 'Processing', 'Settled', 'Expired'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 font-bold uppercase tracking-wider transition-colors ${
                    statusFilter === st
                      ? 'bg-orange-500 text-black'
                      : 'text-white/40 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <button
              id="export-invoices-csv-btn"
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-white/20 hover:bg-white hover:text-black text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              EXPORT CSV
            </button>

            <button
              id="create-invoice-cta-btn"
              onClick={onOpenCreateModal}
              className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-400 active:scale-95 text-black text-xs font-black uppercase tracking-tight transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              CREATE INVOICE
            </button>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="border border-white/10 bg-white/[0.02] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-white">
            <thead className="bg-white/5 text-[10px] uppercase tracking-widest text-white/40 border-b border-white/10">
              <tr>
                <th className="px-5 py-4">Invoice / Order</th>
                <th className="px-5 py-4">Item & Buyer</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Created</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-white/40">
                    <Receipt className="w-8 h-8 text-white/20 mx-auto mb-2" />
                    NO INVOICES FOUND MATCHING CRITERIA.
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => {
                  return (
                    <tr
                      key={inv.id}
                      onClick={() => onSelectInvoice(inv)}
                      className="hover:bg-white/5 transition-colors cursor-pointer group"
                    >
                      <td className="px-5 py-4">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          {inv.orderId}
                          <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-orange-400 transition-opacity" />
                        </div>
                        <div className="text-[11px] text-white/40 mt-0.5">{inv.id}</div>
                      </td>

                      <td className="px-5 py-4 max-w-[220px] truncate">
                        <div className="text-white font-medium truncate">{inv.itemDesc}</div>
                        <div className="text-[11px] text-white/40 truncate">{inv.buyerEmail || 'Anonymous Checkout'}</div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-white font-bold text-sm">{formatFiat(inv.amount, inv.currency)}</div>
                        <div className="text-[11px] text-white/40">
                          {formatCryptoAmount(inv.cryptoAmount, inv.cryptoCurrency)}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {inv.status === 'Settled' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-green-500/20 text-green-400 text-[10px] border border-green-500/30 uppercase font-bold tracking-wider">
                            <CheckCircle2 className="w-3 h-3" />
                            SETTLED
                          </span>
                        )}
                        {inv.status === 'Processing' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] border border-blue-500/30 uppercase font-bold tracking-wider">
                            <Zap className="w-3 h-3 animate-pulse" />
                            PROCESSING
                          </span>
                        )}
                        {inv.status === 'New' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] border border-yellow-500/30 uppercase font-bold tracking-wider">
                            <Clock className="w-3 h-3" />
                            NEW
                          </span>
                        )}
                        {inv.status === 'Expired' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white/10 text-white/40 text-[10px] border border-white/20 uppercase font-bold tracking-wider">
                            EXPIRED
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-[11px] text-white/40">
                        {new Date(inv.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        <div className="text-[10px] text-white/30">{new Date(inv.createdAt).toLocaleDateString()}</div>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {inv.status === 'New' && (
                            <button
                              title="Simulate Instant Payment"
                              onClick={(e) => handleQuickPay(e, inv)}
                              className="px-2.5 py-1 bg-orange-500 hover:bg-orange-400 text-black text-[10px] font-black uppercase tracking-wider transition-colors"
                            >
                              PAY
                            </button>
                          )}
                          <button
                            onClick={() => onSelectInvoice(inv)}
                            className="px-2.5 py-1 border border-white/20 hover:bg-white hover:text-black text-white text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1"
                          >
                            <span>CHECKOUT</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
