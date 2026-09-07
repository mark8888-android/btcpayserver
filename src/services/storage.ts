import {
  Store,
  Invoice,
  PosItem,
  PaymentRequest,
  Payout,
  WebhookConfig,
  WebhookDelivery,
  ApiKey,
  LightningChannel,
  Utxo,
  CryptoCurrency,
  InvoiceStatus,
} from '../types/btcpay';
import { convertFiatToCrypto } from './rates';

const STORAGE_KEYS = {
  STORES: 'btcpay_stores_v1',
  ACTIVE_STORE: 'btcpay_active_store_id_v1',
  INVOICES: 'btcpay_invoices_v1',
  POS_ITEMS: 'btcpay_pos_items_v1',
  PAYMENT_REQUESTS: 'btcpay_payment_requests_v1',
  PAYOUTS: 'btcpay_payouts_v1',
  WEBHOOKS: 'btcpay_webhooks_v1',
  WEBHOOK_DELIVERIES: 'btcpay_webhook_deliveries_v1',
  API_KEYS: 'btcpay_api_keys_v1',
  LIGHTNING_CHANNELS: 'btcpay_lightning_channels_v1',
  UTXOS: 'btcpay_utxos_v1',
};

// Initial Seed Data
const INITIAL_STORES: Store[] = [
  {
    id: 'store_satoshicoffee',
    name: 'Satoshi Coffee & Roasters',
    website: 'https://satoshicoffee.example',
    defaultCurrency: 'USD',
    speedPolicy: 'HighSpeed',
    invoiceExpirationMinutes: 15,
    monitoringMinutes: 1440,
    lightningEnabled: true,
    onChainEnabled: true,
    stablecoinsEnabled: true,
    exchangeRateProvider: 'CoinGecko',
    theme: 'light',
  },
  {
    id: 'store_cyberpunkapparel',
    name: 'Cyberpunk Apparel & Gear',
    website: 'https://cyberpunkgear.example',
    defaultCurrency: 'USD',
    speedPolicy: 'MediumSpeed',
    invoiceExpirationMinutes: 30,
    monitoringMinutes: 1440,
    lightningEnabled: true,
    onChainEnabled: true,
    stablecoinsEnabled: true,
    exchangeRateProvider: 'Kraken',
    theme: 'dark',
  },
];

const INITIAL_POS_ITEMS: PosItem[] = [
  {
    id: 'pos_item_1',
    title: 'Lightning Espresso Double Shot',
    price: 4.5,
    category: 'Beverages',
    image: '☕',
    inventory: 120,
  },
  {
    id: 'pos_item_2',
    title: 'Cold Brew Satoshi Blend 16oz',
    price: 5.75,
    category: 'Beverages',
    image: '🧊',
    inventory: 85,
  },
  {
    id: 'pos_item_3',
    title: 'Artisanal Butter Croissant',
    price: 4.25,
    category: 'Food',
    image: '🥐',
    inventory: 40,
  },
  {
    id: 'pos_item_4',
    title: 'Avocado Sourdough Toast',
    price: 11.5,
    category: 'Food',
    image: '🥑',
    inventory: 25,
  },
  {
    id: 'pos_item_5',
    title: 'Running Bitcoin Embroidered Hoodie',
    price: 65.0,
    category: 'Merch',
    image: '🧥',
    inventory: 30,
  },
  {
    id: 'pos_item_6',
    title: 'OpenNode Metal Seed Phrase Card',
    price: 34.0,
    category: 'Hardware',
    image: '🛡️',
    inventory: 50,
  },
  {
    id: 'pos_item_7',
    title: 'Hardware Wallet Air-Gapped Key',
    price: 149.0,
    category: 'Hardware',
    image: '🔐',
    inventory: 15,
  },
  {
    id: 'pos_item_8',
    title: 'VIP Lightning Summit Ticket 2026',
    price: 250.0,
    category: 'Digital',
    image: '🎟️',
    inventory: 100,
  },
];

const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv_89xK32mP',
    storeId: 'store_satoshicoffee',
    status: 'Settled',
    amount: 14.5,
    currency: 'USD',
    cryptoAmount: 0.00021183,
    cryptoCurrency: 'BTC-LN',
    paymentAddress: 'bc1q87df3k94d2s08j2h56g8u4q21n9m4l5p7a9b',
    lightningInvoice: 'lnbc211830n1p3v98xspp5x89e...',
    rate: 68450,
    orderId: 'ORD-9821',
    itemDesc: '2x Double Shot + Croissant (POS Counter #1)',
    buyerEmail: 'alice.nakamoto@example.com',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    expiresAt: new Date(Date.now() - 3600000 * 1.75).toISOString(),
    paidAt: new Date(Date.now() - 3600000 * 1.95).toISOString(),
    txHash: 'ln-htlc-7781b0a99c4d21ee6f830a',
    confirmations: 1,
    requiredConfirmations: 0,
    receivedAmount: 0.00021183,
  },
  {
    id: 'inv_45vY91rL',
    storeId: 'store_satoshicoffee',
    status: 'Settled',
    amount: 65.0,
    currency: 'USD',
    cryptoAmount: 0.00094959,
    cryptoCurrency: 'BTC',
    paymentAddress: 'bc1q6z8k32x08v57gh2m1np4l0q9r2y8w3e5t7j4',
    rate: 68450,
    orderId: 'ORD-9822',
    itemDesc: 'Running Bitcoin Embroidered Hoodie (Size L)',
    buyerEmail: 'bob.finney@example.com',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    expiresAt: new Date(Date.now() - 3600000 * 4.5).toISOString(),
    paidAt: new Date(Date.now() - 3600000 * 4.8).toISOString(),
    txHash: '9a8d7e6f5c4b3a210fedcba987654321abcdef0123456789abcdef0123456789',
    confirmations: 6,
    requiredConfirmations: 1,
    receivedAmount: 0.00094959,
  },
  {
    id: 'inv_67tW53qN',
    storeId: 'store_satoshicoffee',
    status: 'Processing',
    amount: 149.0,
    currency: 'USD',
    cryptoAmount: 0.00217677,
    cryptoCurrency: 'BTC',
    paymentAddress: 'bc1qx7y2p98w3e5t7j4m1np4l0q9r2y8w3e5t7j9',
    rate: 68450,
    orderId: 'ORD-9823',
    itemDesc: 'Hardware Wallet Air-Gapped Key',
    buyerEmail: 'carol.szabo@example.com',
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 10).toISOString(),
    txHash: '0x8841a0b3c2e1f49a8820c7104b901fead2938472910384759281726354129',
    confirmations: 0,
    requiredConfirmations: 1,
    receivedAmount: 0.00217677,
  },
  {
    id: 'inv_12aB78kZ',
    storeId: 'store_satoshicoffee',
    status: 'New',
    amount: 34.0,
    currency: 'USD',
    cryptoAmount: 34.0,
    cryptoCurrency: 'USDT',
    paymentAddress: '0x71C6F8E934898144026322F26252984B79927A0B',
    rate: 1.0,
    orderId: 'ORD-9824',
    itemDesc: 'OpenNode Metal Seed Phrase Card',
    buyerEmail: 'dave.back@example.com',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
    confirmations: 0,
    requiredConfirmations: 2,
    receivedAmount: 0,
  },
];

const INITIAL_PAYMENT_REQUESTS: PaymentRequest[] = [
  {
    id: 'pr_webdev2026',
    storeId: 'store_satoshicoffee',
    title: 'E-Commerce Website BTCPay Integration Retainer',
    customerEmail: 'finance@satoshimerch.io',
    amount: 1200.0,
    currency: 'USD',
    status: 'Partial',
    paidAmount: 600.0,
    dueDate: '2026-09-30',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    notes: 'Payment for Milestone 1 & 2. Accepts Bitcoin on-chain or Lightning.',
  },
  {
    id: 'pr_consulting99',
    storeId: 'store_satoshicoffee',
    title: 'Lightning Node Liquidity Management Audit',
    customerEmail: 'billing@hydranode.network',
    amount: 850.0,
    currency: 'USD',
    status: 'Pending',
    paidAmount: 0,
    dueDate: '2026-10-15',
    createdAt: new Date().toISOString(),
    notes: 'Channel rebalancing and routing optimization report.',
  },
];

const INITIAL_PAYOUTS: Payout[] = [
  {
    id: 'po_99182',
    storeId: 'store_satoshicoffee',
    destinationAddress: 'bc1q42l4j7v0e8k19m4l5p7a9b87df3k94d2s08j2h',
    cryptoCurrency: 'BTC',
    amountCrypto: 0.045,
    amountFiat: 3080.25,
    fiatCurrency: 'USD',
    status: 'AwaitingApproval',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    recipientNote: 'Organic Coffee Bean Supplier - Weekly Batch #412',
  },
  {
    id: 'po_99183',
    storeId: 'store_satoshicoffee',
    destinationAddress: 'bc1q9823h4k19m4l5p7a9b87df3k94d2s08j2h42l4',
    cryptoCurrency: 'BTC-LN',
    amountCrypto: 0.0012,
    amountFiat: 82.14,
    fiatCurrency: 'USD',
    status: 'Completed',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    txId: 'ln-payout-hash-88390b1',
    recipientNote: 'Barista Tip Pool Distribution (Lightning Payout)',
  },
];

const INITIAL_WEBHOOKS: WebhookConfig[] = [
  {
    id: 'wh_production_api',
    storeId: 'store_satoshicoffee',
    url: 'https://api.satoshicoffee.example/webhooks/btcpay',
    secret: 'whsec_99a8b7c6d5e4f3a2b1c0d9e8f7',
    active: true,
    events: ['invoice_created', 'invoice_receivedPayment', 'invoice_settled', 'invoice_expired'],
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    totalDeliveries: 48,
  },
];

const INITIAL_WEBHOOK_DELIVERIES: WebhookDelivery[] = [
  {
    id: 'del_101',
    webhookId: 'wh_production_api',
    eventType: 'invoice_settled',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    statusCode: 200,
    success: true,
    durationMs: 142,
    payloadJson: JSON.stringify(
      {
        deliveryId: 'del_101',
        webhookId: 'wh_production_api',
        originalDeliveryId: 'del_101',
        isRedelivery: false,
        type: 'InvoiceSettled',
        timestamp: Math.floor(Date.now() / 1000) - 7200,
        storeId: 'store_satoshicoffee',
        invoiceId: 'inv_89xK32mP',
        metadata: {
          orderId: 'ORD-9821',
          itemDesc: '2x Double Shot + Croissant',
        },
      },
      null,
      2
    ),
    responseBody: '{"status":"ok","orderUpdated":true}',
  },
];

const INITIAL_API_KEYS: ApiKey[] = [
  {
    id: 'key_prod_master',
    label: 'WooCommerce & POS Master Key',
    tokenPrefix: 'btcpay_sec_99a4',
    permissions: [
      'btcpay.store.cancreateinvoice',
      'btcpay.store.canviewinvoices',
      'btcpay.store.canmodifyinvoices',
      'btcpay.store.webhooks.canmodifywebhooks',
    ],
    createdAt: '2026-08-15T10:00:00Z',
    lastUsedAt: new Date(Date.now() - 60000 * 12).toISOString(),
  },
  {
    id: 'key_accounting_readonly',
    label: 'QuickBooks Bookkeeping Read-Only',
    tokenPrefix: 'btcpay_sec_41b8',
    permissions: [
      'btcpay.store.canviewinvoices',
      'btcpay.store.canviewreports',
    ],
    createdAt: '2026-08-20T14:30:00Z',
    lastUsedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
];

const INITIAL_LIGHTNING_CHANNELS: LightningChannel[] = [
  {
    id: 'chan_acinq',
    peerAlias: 'ACINQ-Strike-Gateway',
    peerPubKey: '03864ef025fde8fb587d989186ce6a4a186895ee44a926bfc370e2c366597a3f8f',
    capacitySats: 5000000,
    localBalanceSats: 2850000,
    remoteBalanceSats: 2150000,
    status: 'Active',
    channelPoint: '74c5d808e0...:0',
  },
  {
    id: 'chan_kraken',
    peerAlias: 'Kraken-Lightning-01',
    peerPubKey: '02f1a8c87292f35256117941031a8f7c4604777286b613a0766247a2f4d8642691',
    capacitySats: 10000000,
    localBalanceSats: 6200000,
    remoteBalanceSats: 3800000,
    status: 'Active',
    channelPoint: '88a1b2c3d4...:1',
  },
  {
    id: 'chan_river',
    peerAlias: 'River-Financial-L2',
    peerPubKey: '03037dc83ff2a7e7807d8123',
    capacitySats: 4000000,
    localBalanceSats: 1400000,
    remoteBalanceSats: 2600000,
    status: 'Active',
    channelPoint: '19b48c7720...:0',
  },
];

const INITIAL_UTXOS: Utxo[] = [
  {
    txid: '9a8d7e6f5c4b3a210fedcba987654321abcdef0123456789abcdef0123456789',
    vout: 0,
    address: 'bc1q6z8k32x08v57gh2m1np4l0q9r2y8w3e5t7j4',
    amountBtc: 0.00094959,
    confirmations: 6,
    label: 'ORD-9822 Hoodie payment',
  },
  {
    txid: '3b2a10fe9a8d7e6f5c4dcba987654321abcdef0123456789abcdef0123456789',
    vout: 1,
    address: 'bc1q7w9e2r4t6y8u0i1o3p5a7s9d1f3g5h7j9k1l',
    amountBtc: 0.14500000,
    confirmations: 142,
    label: 'Store Reserve Deposit',
  },
  {
    txid: '7104b901fead29384729103847592817263541290x8841a0b3c2e1f49a8820c',
    vout: 0,
    address: 'bc1qx7y2p98w3e5t7j4m1np4l0q9r2y8w3e5t7j9',
    amountBtc: 0.00217677,
    confirmations: 0,
    label: 'Mempool Unconfirmed: ORD-9823',
  },
];

// Helper to safely read from localStorage
function getStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch {
    return fallback;
  }
}

function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('Storage setItem failed:', err);
  }
}

export class BTCPayStorageService {
  // STORES
  static getStores(): Store[] {
    return getStorage<Store[]>(STORAGE_KEYS.STORES, INITIAL_STORES);
  }

  static getActiveStore(): Store {
    const stores = this.getStores();
    const activeId = getStorage<string>(STORAGE_KEYS.ACTIVE_STORE, stores[0]?.id || 'store_satoshicoffee');
    const match = stores.find((s) => s.id === activeId);
    return match || stores[0] || INITIAL_STORES[0];
  }

  static setActiveStore(storeId: string): void {
    setStorage(STORAGE_KEYS.ACTIVE_STORE, storeId);
  }

  static saveStore(store: Store): void {
    const stores = this.getStores();
    const idx = stores.findIndex((s) => s.id === store.id);
    if (idx >= 0) {
      stores[idx] = store;
    } else {
      stores.push(store);
    }
    setStorage(STORAGE_KEYS.STORES, stores);
  }

  // INVOICES
  static getInvoices(storeId?: string): Invoice[] {
    const all = getStorage<Invoice[]>(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);
    if (storeId) {
      return all.filter((inv) => inv.storeId === storeId);
    }
    return all;
  }

  static getInvoiceById(id: string): Invoice | undefined {
    const all = this.getInvoices();
    return all.find((inv) => inv.id === id);
  }

  static createInvoice(params: {
    storeId: string;
    amount: number;
    currency: string;
    cryptoCurrency?: CryptoCurrency;
    orderId?: string;
    itemDesc: string;
    buyerEmail?: string;
    posCartSummary?: string;
  }): Invoice {
    const stores = this.getStores();
    const store = stores.find((s) => s.id === params.storeId) || this.getActiveStore();
    const cryptoCurrency: CryptoCurrency = params.cryptoCurrency || 'BTC-LN';

    const { cryptoAmount, rate } = convertFiatToCrypto(params.amount, params.currency, cryptoCurrency);

    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const id = `inv_${Date.now().toString(36)}${randomHex}`;
    const orderId = params.orderId || `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    let paymentAddress = 'bc1q' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    if (cryptoCurrency === 'USDT' || cryptoCurrency === 'USDC' || cryptoCurrency === 'ETH') {
      paymentAddress = '0x' + Math.random().toString(16).substring(2, 10) + '...' + Math.random().toString(16).substring(2, 6);
    }

    const lightningInvoice =
      cryptoCurrency === 'BTC-LN'
        ? `lnbc${Math.round(cryptoAmount * 100000000)}0n1p${Math.random().toString(36).substring(2, 15)}spp5${Math.random().toString(36).substring(2, 20)}`
        : undefined;

    const expirationMinutes = store.invoiceExpirationMinutes || 15;
    const createdAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000).toISOString();

    const newInvoice: Invoice = {
      id,
      storeId: store.id,
      status: 'New',
      amount: params.amount,
      currency: params.currency,
      cryptoAmount,
      cryptoCurrency,
      paymentAddress,
      lightningInvoice,
      rate,
      orderId,
      itemDesc: params.itemDesc,
      buyerEmail: params.buyerEmail,
      createdAt,
      expiresAt,
      confirmations: 0,
      requiredConfirmations: store.speedPolicy === 'HighSpeed' ? 0 : 1,
      receivedAmount: 0,
      posCartSummary: params.posCartSummary,
    };

    const all = this.getInvoices();
    all.unshift(newInvoice);
    setStorage(STORAGE_KEYS.INVOICES, all);

    // Trigger webhook for invoice_created
    this.triggerWebhooks(store.id, 'invoice_created', {
      type: 'InvoiceCreated',
      invoiceId: newInvoice.id,
      orderId: newInvoice.orderId,
      amount: newInvoice.amount,
      currency: newInvoice.currency,
    });

    return newInvoice;
  }

  static updateInvoiceStatus(invoiceId: string, status: InvoiceStatus, txHash?: string): Invoice | undefined {
    const all = this.getInvoices();
    const invoice = all.find((inv) => inv.id === invoiceId);
    if (!invoice) return undefined;

    invoice.status = status;
    if (status === 'Processing') {
      invoice.receivedAmount = invoice.cryptoAmount;
      invoice.txHash = txHash || '0x' + Math.random().toString(16).substring(2, 34);
      invoice.confirmations = 0;
      this.triggerWebhooks(invoice.storeId, 'invoice_receivedPayment', {
        type: 'InvoiceReceivedPayment',
        invoiceId: invoice.id,
        orderId: invoice.orderId,
        cryptoAmount: invoice.cryptoAmount,
      });
    } else if (status === 'Settled') {
      invoice.receivedAmount = invoice.cryptoAmount;
      invoice.paidAt = new Date().toISOString();
      invoice.confirmations = invoice.requiredConfirmations > 0 ? invoice.requiredConfirmations : 1;
      this.triggerWebhooks(invoice.storeId, 'invoice_settled', {
        type: 'InvoiceSettled',
        invoiceId: invoice.id,
        orderId: invoice.orderId,
        paidAt: invoice.paidAt,
        amount: invoice.amount,
      });
    } else if (status === 'Expired') {
      this.triggerWebhooks(invoice.storeId, 'invoice_expired', {
        type: 'InvoiceExpired',
        invoiceId: invoice.id,
        orderId: invoice.orderId,
      });
    }

    setStorage(STORAGE_KEYS.INVOICES, all);
    return invoice;
  }

  // POS ITEMS
  static getPosItems(): PosItem[] {
    return getStorage<PosItem[]>(STORAGE_KEYS.POS_ITEMS, INITIAL_POS_ITEMS);
  }

  static savePosItem(item: PosItem): void {
    const items = this.getPosItems();
    const idx = items.findIndex((i) => i.id === item.id);
    if (idx >= 0) {
      items[idx] = item;
    } else {
      items.push(item);
    }
    setStorage(STORAGE_KEYS.POS_ITEMS, items);
  }

  static deletePosItem(id: string): void {
    const items = this.getPosItems().filter((i) => i.id !== id);
    setStorage(STORAGE_KEYS.POS_ITEMS, items);
  }

  // PAYMENT REQUESTS
  static getPaymentRequests(storeId?: string): PaymentRequest[] {
    const all = getStorage<PaymentRequest[]>(STORAGE_KEYS.PAYMENT_REQUESTS, INITIAL_PAYMENT_REQUESTS);
    return storeId ? all.filter((pr) => pr.storeId === storeId) : all;
  }

  static createPaymentRequest(req: Omit<PaymentRequest, 'id' | 'createdAt' | 'status' | 'paidAmount'>): PaymentRequest {
    const newReq: PaymentRequest = {
      ...req,
      id: `pr_${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      status: 'Pending',
      paidAmount: 0,
    };
    const all = this.getPaymentRequests();
    all.unshift(newReq);
    setStorage(STORAGE_KEYS.PAYMENT_REQUESTS, all);
    return newReq;
  }

  // PAYOUTS
  static getPayouts(storeId?: string): Payout[] {
    const all = getStorage<Payout[]>(STORAGE_KEYS.PAYOUTS, INITIAL_PAYOUTS);
    return storeId ? all.filter((p) => p.storeId === storeId) : all;
  }

  static createPayout(payout: Omit<Payout, 'id' | 'createdAt' | 'status'>): Payout {
    const newPayout: Payout = {
      ...payout,
      id: `po_${Math.floor(10000 + Math.random() * 90000)}`,
      status: 'AwaitingApproval',
      createdAt: new Date().toISOString(),
    };
    const all = this.getPayouts();
    all.unshift(newPayout);
    setStorage(STORAGE_KEYS.PAYOUTS, all);
    return newPayout;
  }

  static updatePayoutStatus(payoutId: string, status: Payout['status'], txId?: string): void {
    const all = this.getPayouts();
    const match = all.find((p) => p.id === payoutId);
    if (match) {
      match.status = status;
      if (txId) match.txId = txId;
      setStorage(STORAGE_KEYS.PAYOUTS, all);
    }
  }

  // WEBHOOKS
  static getWebhooks(storeId?: string): WebhookConfig[] {
    const all = getStorage<WebhookConfig[]>(STORAGE_KEYS.WEBHOOKS, INITIAL_WEBHOOKS);
    return storeId ? all.filter((w) => w.storeId === storeId) : all;
  }

  static saveWebhook(webhook: WebhookConfig): void {
    const all = this.getWebhooks();
    const idx = all.findIndex((w) => w.id === webhook.id);
    if (idx >= 0) {
      all[idx] = webhook;
    } else {
      all.push(webhook);
    }
    setStorage(STORAGE_KEYS.WEBHOOKS, all);
  }

  static deleteWebhook(id: string): void {
    const all = this.getWebhooks().filter((w) => w.id !== id);
    setStorage(STORAGE_KEYS.WEBHOOKS, all);
  }

  static getWebhookDeliveries(): WebhookDelivery[] {
    return getStorage<WebhookDelivery[]>(STORAGE_KEYS.WEBHOOK_DELIVERIES, INITIAL_WEBHOOK_DELIVERIES);
  }

  static triggerWebhooks(storeId: string, eventType: string, eventData: Record<string, unknown>): void {
    const webhooks = this.getWebhooks(storeId).filter((w) => w.active && w.events.includes(eventType));
    const deliveries = this.getWebhookDeliveries();

    for (const wh of webhooks) {
      wh.totalDeliveries = (wh.totalDeliveries || 0) + 1;
      const delivery: WebhookDelivery = {
        id: `del_${Date.now().toString(36)}${Math.floor(Math.random() * 999)}`,
        webhookId: wh.id,
        eventType,
        timestamp: new Date().toISOString(),
        statusCode: 200,
        success: true,
        durationMs: Math.floor(40 + Math.random() * 120),
        payloadJson: JSON.stringify(
          {
            deliveryId: `del_${Date.now()}`,
            webhookId: wh.id,
            eventType,
            storeId,
            timestamp: Math.floor(Date.now() / 1000),
            data: eventData,
          },
          null,
          2
        ),
        responseBody: '{"status":"received","processed":true}',
      };
      deliveries.unshift(delivery);
    }

    setStorage(STORAGE_KEYS.WEBHOOK_DELIVERIES, deliveries.slice(0, 50));
    setStorage(STORAGE_KEYS.WEBHOOKS, this.getWebhooks());
  }

  // API KEYS
  static getApiKeys(): ApiKey[] {
    return getStorage<ApiKey[]>(STORAGE_KEYS.API_KEYS, INITIAL_API_KEYS);
  }

  static createApiKey(label: string, permissions: string[]): { apiKey: ApiKey; fullSecretToken: string } {
    const secretRandom = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const fullSecretToken = `btcpay_sk_${secretRandom}`;
    const tokenPrefix = `btcpay_sk_${secretRandom.substring(0, 4)}...`;

    const apiKey: ApiKey = {
      id: `key_${Date.now().toString(36)}`,
      label,
      tokenPrefix,
      permissions,
      createdAt: new Date().toISOString(),
    };

    const all = this.getApiKeys();
    all.unshift(apiKey);
    setStorage(STORAGE_KEYS.API_KEYS, all);

    return { apiKey, fullSecretToken };
  }

  static deleteApiKey(id: string): void {
    const all = this.getApiKeys().filter((k) => k.id !== id);
    setStorage(STORAGE_KEYS.API_KEYS, all);
  }

  // LIGHTNING & UTXO
  static getLightningChannels(): LightningChannel[] {
    return getStorage<LightningChannel[]>(STORAGE_KEYS.LIGHTNING_CHANNELS, INITIAL_LIGHTNING_CHANNELS);
  }

  static getUtxos(): Utxo[] {
    return getStorage<Utxo[]>(STORAGE_KEYS.UTXOS, INITIAL_UTXOS);
  }

  static addUtxo(utxo: Utxo): void {
    const all = this.getUtxos();
    all.unshift(utxo);
    setStorage(STORAGE_KEYS.UTXOS, all);
  }
}
