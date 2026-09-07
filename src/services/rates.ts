import { CryptoCurrency } from '../types/btcpay';

export interface ExchangeRates {
  BTC: number;
  ETH: number;
  LTC: number;
  USDT: number;
  USDC: number;
}

export const BASE_RATES: Record<string, ExchangeRates> = {
  USD: {
    BTC: 68450.0,
    ETH: 3580.0,
    LTC: 88.5,
    USDT: 1.0,
    USDC: 1.0,
  },
  EUR: {
    BTC: 63380.0,
    ETH: 3315.0,
    LTC: 82.0,
    USDT: 0.92,
    USDC: 0.92,
  },
  GBP: {
    BTC: 54120.0,
    ETH: 2830.0,
    LTC: 70.0,
    USDT: 0.79,
    USDC: 0.79,
  },
};

export function convertFiatToCrypto(
  fiatAmount: number,
  fiatCurrency: string,
  cryptoCurrency: CryptoCurrency
): { cryptoAmount: number; rate: number } {
  const currencyKey = BASE_RATES[fiatCurrency] ? fiatCurrency : 'USD';
  const rates = BASE_RATES[currencyKey];

  let rate = 1;
  if (cryptoCurrency === 'BTC' || cryptoCurrency === 'BTC-LN') {
    rate = rates.BTC;
  } else if (cryptoCurrency === 'ETH') {
    rate = rates.ETH;
  } else if (cryptoCurrency === 'LTC') {
    rate = rates.LTC;
  } else if (cryptoCurrency === 'USDT') {
    rate = rates.USDT;
  } else if (cryptoCurrency === 'USDC') {
    rate = rates.USDC;
  }

  const cryptoAmount = Number((fiatAmount / rate).toFixed(cryptoCurrency === 'USDT' || cryptoCurrency === 'USDC' ? 2 : 8));
  return { cryptoAmount, rate };
}

export function btcToSats(btcAmount: number): number {
  return Math.round(btcAmount * 100_000_000);
}

export function satsToBtc(sats: number): number {
  return Number((sats / 100_000_000).toFixed(8));
}

export function formatCryptoAmount(amount: number, cryptoCurrency: CryptoCurrency): string {
  if (cryptoCurrency === 'BTC-LN') {
    const sats = btcToSats(amount);
    return `${sats.toLocaleString()} sats`;
  }
  if (cryptoCurrency === 'BTC') {
    return `${amount.toFixed(8)} BTC`;
  }
  if (cryptoCurrency === 'ETH') {
    return `${amount.toFixed(6)} ETH`;
  }
  if (cryptoCurrency === 'LTC') {
    return `${amount.toFixed(4)} LTC`;
  }
  return `${amount.toFixed(2)} ${cryptoCurrency}`;
}

export function formatFiat(amount: number, currency: string = 'USD'): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: 'CA$',
    AUD: 'AU$',
    JPY: '¥',
  };
  const sym = symbols[currency] || '$';
  return `${sym}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
