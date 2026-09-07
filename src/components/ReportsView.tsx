import React from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  Zap,
  TrendingUp,
  PieChart,
  ShieldCheck,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { Store, Invoice } from '../types/btcpay';
import { formatFiat } from '../services/rates';

interface ReportsViewProps {
  activeStore: Store;
  invoices: Invoice[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ activeStore, invoices }) => {
  const settledInvoices = invoices.filter((inv) => inv.status === 'Settled');

  // Breakdown by payment method
  const lnVolume = settledInvoices
    .filter((inv) => inv.cryptoCurrency === 'BTC-LN')
    .reduce((acc, inv) => acc + inv.amount, 0);

  const btcVolume = settledInvoices
    .filter((inv) => inv.cryptoCurrency === 'BTC')
    .reduce((acc, inv) => acc + inv.amount, 0);

  const usdtVolume = settledInvoices
    .filter((inv) => inv.cryptoCurrency === 'USDT' || inv.cryptoCurrency === 'USDC')
    .reduce((acc, inv) => acc + inv.amount, 0);

  const totalSettled = lnVolume + btcVolume + usdtVolume || 1; // avoid / 0

  const lnShare = Math.round((lnVolume / totalSettled) * 100);
  const btcShare = Math.round((btcVolume / totalSettled) * 100);
  const usdtShare = 100 - lnShare - btcShare;

  const handleDownloadLedger = () => {
    const data = JSON.stringify(settledInvoices, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `btcpay_accounting_ledger_${activeStore.id}.json`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.03] border border-white/10 p-6 font-mono">
        <div>
          <h3 className="text-xl font-black text-white uppercase tracking-tighter">Financial & Settlement Reports</h3>
          <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">
            Non-custodial settlement reports ready for bookkeeping, audits, and tax reporting
          </p>
        </div>
        <button
          id="download-ledger-json-btn"
          onClick={handleDownloadLedger}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-400 text-black text-xs font-black uppercase tracking-tight transition-all cursor-pointer shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Ledger JSON</span>
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
        <div className="bg-white/[0.03] border border-white/10 p-6 space-y-2">
          <div className="flex items-center justify-between text-[10px] text-white/40 font-bold uppercase tracking-widest">
            <span>Lightning Network</span>
            <Zap className="w-4 h-4 text-orange-400 fill-orange-400" />
          </div>
          <div className="text-3xl font-black text-white tracking-tighter">{formatFiat(lnVolume, activeStore.defaultCurrency)}</div>
          <div className="text-xs text-orange-400 font-bold uppercase tracking-wider">{lnShare}% of settled volume</div>
          <div className="text-[10px] text-white/30 uppercase tracking-wider">Average fee: $0.0001 · Instant settlement</div>
        </div>

        <div className="bg-white/[0.03] border border-white/10 p-6 space-y-2">
          <div className="flex items-center justify-between text-[10px] text-white/40 font-bold uppercase tracking-widest">
            <span>Bitcoin On-Chain</span>
            <span className="text-orange-400 font-bold text-sm">₿</span>
          </div>
          <div className="text-3xl font-black text-white tracking-tighter">{formatFiat(btcVolume, activeStore.defaultCurrency)}</div>
          <div className="text-xs text-orange-400 font-bold uppercase tracking-wider">{btcShare}% of settled volume</div>
          <div className="text-[10px] text-white/30 uppercase tracking-wider">Average confirmation: 9.4 mins</div>
        </div>

        <div className="bg-white/[0.03] border border-white/10 p-6 space-y-2">
          <div className="flex items-center justify-between text-[10px] text-white/40 font-bold uppercase tracking-widest">
            <span>Stablecoins (USDT/USDC)</span>
            <span className="text-green-400 font-bold text-sm">₮</span>
          </div>
          <div className="text-3xl font-black text-white tracking-tighter">{formatFiat(usdtVolume, activeStore.defaultCurrency)}</div>
          <div className="text-xs text-green-400 font-bold uppercase tracking-wider">{usdtShare}% of settled volume</div>
          <div className="text-[10px] text-white/30 uppercase tracking-wider">Dollar pegged settlements</div>
        </div>
      </div>

      {/* Visual Volume Bar */}
      <div className="bg-white/[0.03] border border-white/10 p-6 space-y-4 font-mono">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-white">
          <span className="flex items-center gap-1.5">
            <PieChart className="w-4 h-4 text-orange-500" />
            Payment Protocol Distribution
          </span>
          <span className="text-white/40 text-[10px] uppercase tracking-wider font-bold">100% Non-Custodial</span>
        </div>

        <div className="h-4 bg-black overflow-hidden flex border border-white/20">
          <div
            style={{ width: `${lnShare}%` }}
            className="bg-orange-500 h-full"
            title={`Lightning: ${lnShare}%`}
          ></div>
          <div
            style={{ width: `${btcShare}%` }}
            className="bg-orange-700 h-full"
            title={`On-chain BTC: ${btcShare}%`}
          ></div>
          <div
            style={{ width: `${usdtShare}%` }}
            className="bg-green-500 h-full"
            title={`Stablecoins: ${usdtShare}%`}
          ></div>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-[10px] text-white/60 uppercase tracking-wider font-bold pt-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-orange-500"></span>
            <span>Lightning Network ({lnShare}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-orange-700"></span>
            <span>Bitcoin On-Chain ({btcShare}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-green-500"></span>
            <span>Stablecoins ({usdtShare}%)</span>
          </div>
        </div>
      </div>

      {/* Accounting Transactions Breakdown */}
      <div className="bg-white/[0.03] border border-white/10 p-6 space-y-4 font-mono">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black text-white uppercase tracking-widest">Settlement Audit Log</h4>
          <span className="text-[10px] text-white/40 font-mono uppercase tracking-wider font-bold">{settledInvoices.length} Settled Invoices</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-white">
            <thead className="bg-black/60 text-[10px] text-white/40 uppercase tracking-widest border-b border-white/10">
              <tr>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Settled Date</th>
                <th className="px-4 py-3">Fiat Amount</th>
                <th className="px-4 py-3">Crypto Paid</th>
                <th className="px-4 py-3">Exchange Rate</th>
                <th className="px-4 py-3 text-right">Blockchain Tx Proof</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {settledInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-bold text-white uppercase">{inv.orderId}</td>
                  <td className="px-4 py-3 text-white/70">{inv.paidAt ? new Date(inv.paidAt).toLocaleString() : 'N/A'}</td>
                  <td className="px-4 py-3 text-white font-black">{formatFiat(inv.amount, inv.currency)}</td>
                  <td className="px-4 py-3 text-green-400 font-bold">{inv.cryptoAmount} {inv.cryptoCurrency}</td>
                  <td className="px-4 py-3 text-white/40">1 BTC = ${inv.rate.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-white/40 truncate max-w-[180px]">
                    {inv.txHash || 'Mempool-settled'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
