import React, { useState } from 'react';
import {
  Webhook,
  Key,
  Plus,
  Trash2,
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Code2,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { Store, WebhookConfig, WebhookDelivery, ApiKey } from '../types/btcpay';
import { BTCPayStorageService } from '../services/storage';

interface WebhooksApiViewProps {
  activeStore: Store;
}

export const WebhooksApiView: React.FC<WebhooksApiViewProps> = ({ activeStore }) => {
  const [subTab, setSubTab] = useState<'webhooks' | 'apikeys'>('webhooks');
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>(() =>
    BTCPayStorageService.getWebhooks(activeStore.id)
  );
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>(() =>
    BTCPayStorageService.getWebhookDeliveries()
  );
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(() => BTCPayStorageService.getApiKeys());

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [expandedDeliveryId, setExpandedDeliveryId] = useState<string | null>(null);

  // New Webhook Modal
  const [showNewWebhookModal, setShowNewWebhookModal] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('whsec_' + Math.random().toString(36).substring(2, 14));
  const [selectedEvents, setSelectedEvents] = useState<string[]>([
    'invoice_created',
    'invoice_receivedPayment',
    'invoice_settled',
    'invoice_expired',
  ]);

  // New API Key Modal
  const [showNewApiKeyModal, setShowNewApiKeyModal] = useState(false);
  const [apiKeyLabel, setApiKeyLabel] = useState('');
  const [generatedSecret, setGeneratedSecret] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCreateWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrl) return;

    const newWh: WebhookConfig = {
      id: `wh_${Date.now().toString(36)}`,
      storeId: activeStore.id,
      url: webhookUrl,
      secret: webhookSecret,
      active: true,
      events: selectedEvents,
      createdAt: new Date().toISOString(),
      totalDeliveries: 0,
    };

    BTCPayStorageService.saveWebhook(newWh);
    setWebhooks(BTCPayStorageService.getWebhooks(activeStore.id));
    setShowNewWebhookModal(false);
    setWebhookUrl('');
  };

  const handleDeleteWebhook = (id: string) => {
    BTCPayStorageService.deleteWebhook(id);
    setWebhooks(BTCPayStorageService.getWebhooks(activeStore.id));
  };

  const handleTestDeliverWebhook = (wh: WebhookConfig) => {
    BTCPayStorageService.triggerWebhooks(activeStore.id, 'invoice_settled', {
      testPing: true,
      simulatedEvent: 'InvoiceSettled',
      amount: 49.99,
      currency: activeStore.defaultCurrency,
      deliveredAt: new Date().toISOString(),
    });
    setDeliveries(BTCPayStorageService.getWebhookDeliveries());
  };

  const handleCreateApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyLabel) return;

    const { apiKey, fullSecretToken } = BTCPayStorageService.createApiKey(apiKeyLabel, [
      'btcpay.store.cancreateinvoice',
      'btcpay.store.canviewinvoices',
      'btcpay.store.canmodifyinvoices',
    ]);

    setApiKeys(BTCPayStorageService.getApiKeys());
    setGeneratedSecret(fullSecretToken);
    setApiKeyLabel('');
  };

  const handleDeleteApiKey = (id: string) => {
    BTCPayStorageService.deleteApiKey(id);
    setApiKeys(BTCPayStorageService.getApiKeys());
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Navigation */}
      <div className="flex items-center justify-between bg-white/[0.03] border border-white/10 p-2 font-mono">
        <div className="flex items-center gap-2">
          <button
            id="tab-webhooks-btn"
            onClick={() => setSubTab('webhooks')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-tight transition-all cursor-pointer ${
              subTab === 'webhooks'
                ? 'bg-orange-500 text-black'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Webhook className="w-3.5 h-3.5" />
            <span>Webhooks Subscriptions</span>
          </button>
          <button
            id="tab-apikeys-btn"
            onClick={() => setSubTab('apikeys')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-tight transition-all cursor-pointer ${
              subTab === 'apikeys'
                ? 'bg-orange-500 text-black'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Greenfield API Keys</span>
          </button>
        </div>

        {subTab === 'webhooks' ? (
          <button
            id="register-webhook-btn"
            onClick={() => setShowNewWebhookModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-black text-xs font-black uppercase tracking-tight transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Register Webhook
          </button>
        ) : (
          <button
            id="create-apikey-btn"
            onClick={() => {
              setGeneratedSecret(null);
              setShowNewApiKeyModal(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-black text-xs font-black uppercase tracking-tight transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Generate API Key
          </button>
        )}
      </div>

      {subTab === 'webhooks' ? (
        <div className="space-y-6">
          {/* Webhooks Endpoints Card */}
          <div className="bg-white/[0.03] border border-white/10 p-6 space-y-4 font-mono">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-widest">Registered Endpoints</h4>
                <p className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">
                  HTTP POST notifications for invoice lifecycle events, signed with HMAC-SHA256
                </p>
              </div>
              <span className="text-[10px] text-white/40 font-mono uppercase tracking-wider font-bold">{webhooks.length} Active Endpoints</span>
            </div>

            {webhooks.length === 0 ? (
              <div className="text-center py-8 text-white/40 text-xs font-mono uppercase tracking-widest">
                No webhooks configured for this store yet. Click "Register Webhook" above.
              </div>
            ) : (
              <div className="space-y-3">
                {webhooks.map((wh) => (
                  <div
                    key={wh.id}
                    className="p-4 bg-black border border-white/20 flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono"
                  >
                    <div className="space-y-1 truncate">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-400"></span>
                        <span className="text-xs font-bold text-white font-mono truncate">{wh.url}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {wh.events.map((ev) => (
                          <span
                            key={ev}
                            className="px-2 py-0.5 bg-white/5 text-white/70 text-[10px] font-mono border border-white/10 uppercase"
                          >
                            {ev}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleTestDeliverWebhook(wh)}
                        className="px-3 py-1.5 border border-orange-500/40 bg-orange-500/10 text-orange-400 hover:bg-orange-500 hover:text-black text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Send className="w-3 h-3" />
                        Send Test Ping
                      </button>
                      <button
                        onClick={() => handleDeleteWebhook(wh.id)}
                        className="p-1.5 border border-white/20 hover:bg-rose-900/40 text-white/40 hover:text-rose-300 transition-colors"
                        title="Delete Webhook"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Webhook Deliveries Log */}
          <div className="bg-white/[0.03] border border-white/10 p-6 space-y-4 font-mono">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-widest">Recent Webhook Deliveries</h4>
                <p className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">
                  Inspecting payloads, HTTP response codes, and network latency
                </p>
              </div>
              <span className="text-[10px] text-white/40 font-mono uppercase tracking-wider font-bold">{deliveries.length} Logged Events</span>
            </div>

            <div className="space-y-2">
              {deliveries.length === 0 ? (
                <div className="text-center py-6 text-white/40 text-xs uppercase tracking-widest">
                  No webhook deliveries recorded yet.
                </div>
              ) : (
                deliveries.map((del) => {
                  const isExpanded = expandedDeliveryId === del.id;
                  return (
                    <div
                      key={del.id}
                      className="bg-black border border-white/20 overflow-hidden text-xs font-mono"
                    >
                      <div
                        onClick={() => setExpandedDeliveryId(isExpanded ? null : del.id)}
                        className="p-3 flex items-center justify-between hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              del.statusCode === 200
                                ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            HTTP {del.statusCode}
                          </span>
                          <span className="font-bold text-white uppercase">{del.eventType}</span>
                          <span className="text-white/40 hidden sm:inline">{del.durationMs}ms</span>
                        </div>

                        <div className="flex items-center gap-3 text-white/40 font-mono text-[10px] uppercase">
                          <span>{new Date(del.timestamp).toLocaleTimeString()}</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-4 bg-white/[0.02] border-t border-white/10 space-y-3">
                          <div>
                            <div className="text-white/40 font-mono mb-1 text-[10px] uppercase tracking-wider flex justify-between">
                              <span>Payload JSON (POST body):</span>
                              <button
                                onClick={() => handleCopy(del.payloadJson, del.id)}
                                className="text-orange-400 hover:underline flex items-center gap-1 font-bold"
                              >
                                {copiedKey === del.id ? 'COPIED' : 'COPY JSON'}
                              </button>
                            </div>
                            <pre className="p-3 bg-black border border-white/20 font-mono text-[11px] text-green-300 overflow-x-auto max-h-48">
                              {del.payloadJson}
                            </pre>
                          </div>
                          {del.responseBody && (
                            <div>
                              <div className="text-white/40 font-mono mb-1 text-[10px] uppercase tracking-wider">Server Response:</div>
                              <pre className="p-2 bg-black border border-white/20 font-mono text-[11px] text-white/70">
                                {del.responseBody}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : (
        /* API KEYS MANAGEMENT */
        <div className="bg-white/[0.03] border border-white/10 p-6 space-y-4 font-mono">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-widest">Greenfield REST API Keys</h4>
              <p className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">
                Grant programmatical access to stores, invoices, and payment requests via Bearer token
              </p>
            </div>
            <span className="text-[10px] text-white/40 font-mono uppercase tracking-wider font-bold">{apiKeys.length} Active Keys</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white">
              <thead className="bg-black/60 text-[10px] uppercase tracking-widest text-white/40 border-b border-white/10">
                <tr>
                  <th className="px-4 py-3">Label</th>
                  <th className="px-4 py-3">Key Prefix</th>
                  <th className="px-4 py-3">Permissions</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {apiKeys.map((k) => (
                  <tr key={k.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-bold text-white uppercase">{k.label}</td>
                    <td className="px-4 py-3 font-mono text-xs text-white/70">{k.tokenPrefix}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {k.permissions.map((p) => (
                          <span
                            key={p}
                            className="px-1.5 py-0.5 bg-white/5 text-[10px] font-mono text-orange-400 border border-white/10 uppercase"
                          >
                            {p.replace('btcpay.store.', '')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-white/40 font-mono">
                      {new Date(k.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteApiKey(k.id)}
                        className="p-1.5 text-white/40 hover:text-rose-400 transition-colors"
                        title="Revoke Key"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quick Code Snippet */}
          <div className="mt-6 p-4 bg-black border border-white/20 space-y-2 font-mono">
            <div className="flex items-center justify-between text-[10px] text-white/40 uppercase tracking-wider">
              <span className="flex items-center gap-1.5 text-orange-400 font-bold">
                <Code2 className="w-4 h-4" />
                Quick cURL Request (Greenfield API v1)
              </span>
              <span>Authorization: token btcpay_sk_...</span>
            </div>
            <pre className="text-[11px] font-mono text-white/80 overflow-x-auto p-2">
              {`curl -X POST https://btcpay.example/api/v1/stores/${activeStore.id}/invoices \\
  -H "Authorization: token YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"amount": 50.00, "currency": "USD", "metadata": {"orderId": "1004"}}'`}
            </pre>
          </div>
        </div>
      )}

      {/* New Webhook Modal */}
      {showNewWebhookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0A0A0A] border border-white/20 p-6 shadow-2xl space-y-5 text-white font-mono">
            <h3 className="text-sm font-black text-white uppercase tracking-tight">Register Webhook Endpoint</h3>
            <form onSubmit={handleCreateWebhook} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-1.5">Payload URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://mysite.com/api/btcpay-webhook"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white font-mono focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-1.5">Secret (HMAC Signature)</label>
                <input
                  type="text"
                  required
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white font-mono focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-1.5">Subscribed Events</label>
                <div className="space-y-2">
                  {['invoice_created', 'invoice_receivedPayment', 'invoice_settled', 'invoice_expired'].map((ev) => (
                    <label key={ev} className="flex items-center gap-2 text-white/80 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedEvents.includes(ev)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEvents([...selectedEvents, ev]);
                          } else {
                            setSelectedEvents(selectedEvents.filter((item) => item !== ev));
                          }
                        }}
                        className="rounded-none border-white/20 bg-white/5 text-orange-500 focus:ring-orange-500"
                      />
                      <span className="font-mono text-xs">{ev}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewWebhookModal(false)}
                  className="px-4 py-2.5 border border-white/20 text-white hover:bg-white hover:text-black uppercase text-xs tracking-wider font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-black font-black uppercase text-xs tracking-tight transition-all cursor-pointer"
                >
                  Save Webhook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New API Key Modal */}
      {showNewApiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0A0A0A] border border-white/20 p-6 shadow-2xl space-y-5 text-white font-mono">
            <h3 className="text-sm font-black text-white uppercase tracking-tight">Generate Greenfield API Key</h3>

            {generatedSecret ? (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-orange-500/10 border border-orange-500/30 text-orange-400 font-bold uppercase tracking-wider text-[10px]">
                  ⚠️ Copy your API key now. It cannot be shown again.
                </div>
                <div className="p-3 bg-black font-mono text-green-400 break-all select-all border border-white/20 text-xs">
                  {generatedSecret}
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => handleCopy(generatedSecret, 'new_secret')}
                    className="px-4 py-2.5 bg-orange-500 hover:bg-orange-400 text-black font-black uppercase text-xs tracking-tight flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedKey === 'new_secret' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedKey === 'new_secret' ? 'Copied' : 'Copy Key'}</span>
                  </button>
                  <button
                    onClick={() => setShowNewApiKeyModal(false)}
                    className="px-4 py-2.5 border border-white/20 text-white hover:bg-white hover:text-black uppercase text-xs font-bold tracking-wider"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateApiKey} className="space-y-4 text-xs">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-1.5">Key Label</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shopify Backend Integration"
                    value={apiKeyLabel}
                    onChange={(e) => setApiKeyLabel(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white focus:outline-none focus:border-orange-500 font-sans"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewApiKeyModal(false)}
                    className="px-4 py-2.5 border border-white/20 text-white hover:bg-white hover:text-black uppercase text-xs tracking-wider font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-black font-black uppercase text-xs tracking-tight transition-all cursor-pointer"
                  >
                    Generate
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
