export type CryptoCurrency = 'BTC' | 'BTC-LN' | 'USDT' | 'USDC' | 'ETH' | 'LTC';

export type InvoiceStatus = 'New' | 'Processing' | 'Settled' | 'Expired' | 'Invalid';

export type SpeedPolicy = 'HighSpeed' | 'MediumSpeed' | 'IsFullyConfirmed';

export interface Store {
  id: string;
  name: string;
  website: string;
  defaultCurrency: string;
  speedPolicy: SpeedPolicy;
  invoiceExpirationMinutes: number;
  monitoringMinutes: number;
  lightningEnabled: boolean;
  onChainEnabled: boolean;
  stablecoinsEnabled: boolean;
  exchangeRateProvider: string;
  customLogoUrl?: string;
  theme: 'dark' | 'light' | 'system';
}

export interface Invoice {
  id: string;
  storeId: string;
  status: InvoiceStatus;
  amount: number;
  currency: string;
  cryptoAmount: number;
  cryptoCurrency: CryptoCurrency;
  paymentAddress: string;
  lightningInvoice?: string;
  rate: number;
  orderId: string;
  itemDesc: string;
  buyerEmail?: string;
  createdAt: string;
  expiresAt: string;
  paidAt?: string;
  txHash?: string;
  confirmations: number;
  requiredConfirmations: number;
  receivedAmount: number;
  redirectUrl?: string;
  posCartSummary?: string;
}

export interface PosItem {
  id: string;
  title: string;
  price: number;
  category: 'Beverages' | 'Food' | 'Merch' | 'Hardware' | 'Digital';
  image: string;
  inventory?: number;
}

export interface PosCartItem {
  item: PosItem;
  quantity: number;
}

export interface PaymentRequest {
  id: string;
  storeId: string;
  title: string;
  customerEmail: string;
  amount: number;
  currency: string;
  status: 'Pending' | 'Partial' | 'Completed' | 'Expired';
  paidAmount: number;
  dueDate: string;
  createdAt: string;
  notes?: string;
}

export interface Payout {
  id: string;
  storeId: string;
  destinationAddress: string;
  cryptoCurrency: CryptoCurrency;
  amountCrypto: number;
  amountFiat: number;
  fiatCurrency: string;
  status: 'AwaitingApproval' | 'InProgress' | 'Completed' | 'Cancelled';
  createdAt: string;
  txId?: string;
  recipientNote?: string;
}

export interface WebhookConfig {
  id: string;
  storeId: string;
  url: string;
  secret: string;
  active: boolean;
  events: string[];
  createdAt: string;
  totalDeliveries: number;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  eventType: string;
  timestamp: string;
  statusCode: number;
  success: boolean;
  durationMs: number;
  payloadJson: string;
  responseBody?: string;
}

export interface ApiKey {
  id: string;
  label: string;
  tokenPrefix: string;
  permissions: string[];
  createdAt: string;
  lastUsedAt?: string;
}

export interface LightningChannel {
  id: string;
  peerAlias: string;
  peerPubKey: string;
  capacitySats: number;
  localBalanceSats: number;
  remoteBalanceSats: number;
  status: 'Active' | 'Inactive' | 'Pending';
  channelPoint: string;
}

export interface Utxo {
  txid: string;
  vout: number;
  address: string;
  amountBtc: number;
  confirmations: number;
  label?: string;
}
