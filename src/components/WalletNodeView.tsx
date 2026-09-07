import React, { useState } from 'react';
import {
  Wallet,
  Zap,
  Network,
  ArrowDownLeft,
  ArrowUpRight,
  Shield,
  Layers,
  Copy,
  Check,
  RefreshCw,
  Plus,
  ExternalLink,
  Fuel,
  Info,
} from 'lucide-react';
import { Store, LightningChannel, Utxo } from '../types/btcpay';
import { BTCPayStorageService } from '../services/storage';
import { BASE_RATES, formatFiat } from '../services/rates';

interface WalletNodeViewProps {
  activeStore: Store;
}

export const WalletNodeView: React.FC<WalletNodeViewProps> = ({ activeStore }) => {
  const [channels, setChannels] = useState<LightningChannel[]>(() => BTCPayStorageService.getLightningChannels());
  const [utxos, setUtxos] = useState<Utxo[]>(() => BTCPayStorageService.getUtxos());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [generatedAddress, setGeneratedAddress] = useState<string>('bc1q84z9w2u3v0e5y7k19m4l5p7a9b87df3k94d2s08j2h');

  const btcPrice = BASE_RATES.USD.BTC;

  // On-chain total calculation
  const totalBtcOnChain = utxos.reduce((acc, u) => acc + u.amountBtc, 0);
  const totalBtcFiat = totalBtcOnChain * btcPrice;

  // Lightning total calculation
  const totalLocalSats = channels.reduce((acc, c) => acc + c.localBalanceSats, 0);
  const totalCapacitySats = channels.reduce((acc, c) => acc + c.capacitySats, 0);
  const lightningBtc = totalLocalSats / 100_000_000;
  const lightningFiat = lightningBtc * btcPrice;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGenerateFreshAddress = () => {
    const fresh = 'bc1q' + Array.from({ length: 38 }, () => Math.floor(Math.random() * 36).toString(36)).join('');
    setGeneratedAddress(fresh);
  };

  return (
    <div className="space-y-6">
      {/* Wallet Balance Hero Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* On-Chain Bitcoin Wallet Card */}
        <div className="bg-white/[0.03] border border-white/10 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 font-bold font-mono">
                <span>₿</span>
              </div>
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-tight font-mono">On-Chain Wallet</h3>
                <p className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Watch-Only BIP-84 Synced</p>
              </div>
            </div>
            <span className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-500/30 flex items-center gap-1.5">
              <Shield className="w-3 h-3" /> HW Synced
            </span>
          </div>

          <div>
            <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tighter">
              {totalBtcOnChain.toFixed(8)} <span className="text-orange-400 text-xl font-black">BTC</span>
            </div>
            <div className="text-xs text-white/40 font-mono uppercase tracking-wider mt-1">
              ≈ {formatFiat(totalBtcFiat, 'USD')} USD
            </div>
          </div>

          {/* Fresh Address Generation Box */}
          <div className="p-4 bg-black border border-white/20 space-y-2 font-mono">
            <div className="flex items-center justify-between text-[10px] text-white/40 uppercase tracking-widest">
              <span>Fresh Receive Address (Native SegWit)</span>
              <button
                onClick={handleGenerateFreshAddress}
                className="text-orange-400 hover:text-orange-300 flex items-center gap-1 font-bold tracking-wider"
              >
                <RefreshCw className="w-3 h-3" />
                NEW ADDR
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 text-xs text-white/80 truncate select-all">
                {generatedAddress}
              </div>
              <button
                onClick={() => handleCopy(generatedAddress, 'fresh_addr')}
                className="p-1.5 border border-white/20 hover:bg-white hover:text-black text-white transition-colors shrink-0"
              >
                {copiedKey === 'fresh_addr' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Network Fee Estimator Pill */}
          <div className="flex items-center justify-between text-[10px] font-mono text-white/40 border-t border-white/10 pt-3 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Fuel className="w-3.5 h-3.5 text-orange-400" />
              Mempool Recommended:
            </span>
            <span className="text-white">
              Fast: <strong className="text-orange-400">22</strong> sat/vB · Med: 16 · Low: 10
            </span>
          </div>
        </div>

        {/* Lightning Node Card */}
        <div className="bg-white/[0.03] border border-white/10 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 font-bold">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-tight font-mono">Lightning Network Node</h3>
                <p className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Core Lightning / LND REST</p>
              </div>
            </div>
            <span className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Node Online
            </span>
          </div>

          <div>
            <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tighter">
              {totalLocalSats.toLocaleString()} <span className="text-orange-400 text-xl font-black">sats</span>
            </div>
            <div className="text-xs text-white/40 font-mono uppercase tracking-wider mt-1">
              ≈ {formatFiat(lightningFiat, 'USD')} USD ({lightningBtc.toFixed(6)} BTC)
            </div>
          </div>

          {/* Channel Liquidity Progress Bar */}
          <div className="space-y-1.5 font-mono">
            <div className="flex justify-between text-[10px] text-white/40 uppercase tracking-widest">
              <span>Local Outbound: {((totalLocalSats / totalCapacitySats) * 100).toFixed(0)}%</span>
              <span>Capacity: {(totalCapacitySats / 100_000_000).toFixed(2)} BTC</span>
            </div>
            <div className="h-3 bg-black overflow-hidden flex border border-white/20">
              <div
                style={{ width: `${(totalLocalSats / totalCapacitySats) * 100}%` }}
                className="bg-orange-500 h-full"
                title="Local outbound liquidity"
              ></div>
              <div
                style={{ width: `${100 - (totalLocalSats / totalCapacitySats) * 100}%` }}
                className="bg-white/10 h-full"
                title="Remote inbound liquidity"
              ></div>
            </div>
            <div className="flex justify-between text-[10px] text-white/30 uppercase tracking-widest">
              <span>Spendable (Outbound)</span>
              <span>Receivable (Inbound)</span>
            </div>
          </div>

          {/* Public Node URI */}
          <div className="flex items-center justify-between text-[10px] text-white/40 border-t border-white/10 pt-3 font-mono uppercase tracking-wider">
            <span className="truncate max-w-[280px]">
              03864ef025fde8fb587d... @ 45.33.28.190:9735
            </span>
            <button
              onClick={() => handleCopy('03864ef025fde8fb587d989186ce6a4a186895ee44a926bfc370e2c366597a3f8f@45.33.28.190:9735', 'node_uri')}
              className="text-orange-400 hover:text-orange-300 font-bold shrink-0"
            >
              {copiedKey === 'node_uri' ? 'COPIED' : 'COPY URI'}
            </button>
          </div>
        </div>
      </div>

      {/* Lightning Active Channels */}
      <div className="bg-white/[0.03] border border-white/10 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-orange-500" />
            <h4 className="text-xs font-black text-white uppercase tracking-widest font-mono">Active Lightning Channels</h4>
          </div>
          <span className="text-[10px] text-white/40 font-mono uppercase tracking-wider font-bold">{channels.length} Routing Peers</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-white">
            <thead className="bg-black/60 text-white/40 uppercase tracking-widest border-b border-white/10 text-[10px]">
              <tr>
                <th className="px-4 py-3">Peer & Alias</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Total Capacity</th>
                <th className="px-4 py-3">Local Balance</th>
                <th className="px-4 py-3">Remote Balance</th>
                <th className="px-4 py-3 text-right">Channel Point</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {channels.map((chan) => (
                <tr key={chan.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-medium text-white">
                    <div className="font-sans font-bold uppercase tracking-tight text-xs">{chan.peerAlias}</div>
                    <div className="text-[10px] text-white/40 truncate max-w-[180px]">{chan.peerPubKey}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 text-[10px] bg-green-500/10 text-green-400 border border-green-500/30 font-bold uppercase tracking-wider">
                      {chan.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white font-black">
                    {(chan.capacitySats / 100_000_000).toFixed(3)} BTC
                  </td>
                  <td className="px-4 py-3 text-orange-400 font-bold">
                    {chan.localBalanceSats.toLocaleString()} sats
                  </td>
                  <td className="px-4 py-3 text-white/50">
                    {chan.remoteBalanceSats.toLocaleString()} sats
                  </td>
                  <td className="px-4 py-3 text-right text-white/40">
                    {chan.channelPoint}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* On-Chain UTXO Ledger */}
      <div className="bg-white/[0.03] border border-white/10 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-orange-500" />
            <h4 className="text-xs font-black text-white uppercase tracking-widest font-mono">UTXO Coin Control Ledger</h4>
          </div>
          <span className="text-[10px] text-white/40 font-mono uppercase tracking-wider font-bold">{utxos.length} Output Coins</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-white">
            <thead className="bg-black/60 text-white/40 uppercase tracking-widest border-b border-white/10 text-[10px]">
              <tr>
                <th className="px-4 py-3">TxID : Vout</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">Amount (BTC)</th>
                <th className="px-4 py-3">Value (USD)</th>
                <th className="px-4 py-3">Confirmations</th>
                <th className="px-4 py-3 text-right">Label</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {utxos.map((u, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-medium text-white truncate max-w-[150px]">
                    {u.txid.substring(0, 14)}...:{u.vout}
                  </td>
                  <td className="px-4 py-3 text-white/60 truncate max-w-[160px]">
                    {u.address}
                  </td>
                  <td className="px-4 py-3 text-orange-400 font-bold">
                    {u.amountBtc.toFixed(8)}
                  </td>
                  <td className="px-4 py-3 text-white">
                    {formatFiat(u.amountBtc * btcPrice, 'USD')}
                  </td>
                  <td className="px-4 py-3">
                    {u.confirmations > 0 ? (
                      <span className="text-green-400 font-bold uppercase tracking-wider text-[10px]">{u.confirmations} confs</span>
                    ) : (
                      <span className="text-blue-400 font-bold uppercase tracking-wider text-[10px] animate-pulse">0 conf (mempool)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-white/40 font-sans text-xs">
                    {u.label || 'Unlabeled'}
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
