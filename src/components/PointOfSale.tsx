import React, { useState } from 'react';
import {
  ShoppingBag,
  Calculator,
  Plus,
  Minus,
  Trash2,
  Zap,
  Tag,
  Percent,
  Receipt,
  ArrowRight,
  Coffee,
  Check,
} from 'lucide-react';
import { PosItem, PosCartItem, Store, Invoice } from '../types/btcpay';
import { formatFiat, BASE_RATES } from '../services/rates';
import { BTCPayStorageService } from '../services/storage';

interface PointOfSaleProps {
  activeStore: Store;
  onInvoiceCreated: (invoice: Invoice) => void;
}

export const PointOfSale: React.FC<PointOfSaleProps> = ({
  activeStore,
  onInvoiceCreated,
}) => {
  const [posMode, setPosMode] = useState<'items' | 'keypad'>('items');
  const [items, setItems] = useState<PosItem[]>(() => BTCPayStorageService.getPosItems());
  const [cart, setCart] = useState<PosCartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  // Keypad state
  const [keypadAmountStr, setKeypadAmountStr] = useState<string>('0');
  const [keypadNote, setKeypadNote] = useState<string>('');
  const [tipPercent, setTipPercent] = useState<number>(0);

  // New item modal state
  const [showAddItemModal, setShowAddItemModal] = useState<boolean>(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<PosItem['category']>('Beverages');
  const [newItemEmoji, setNewItemEmoji] = useState('⚡');

  // Cart operations
  const addToCart = (item: PosItem) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.item.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.item.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((ci) => {
          if (ci.item.id === itemId) {
            const newQty = ci.quantity + delta;
            return newQty > 0 ? { ...ci, quantity: newQty } : null;
          }
          return ci;
        })
        .filter(Boolean) as PosCartItem[]
    );
  };

  const clearCart = () => setCart([]);

  // Calculate cart totals
  const subtotal = cart.reduce((acc, ci) => acc + ci.item.price * ci.quantity, 0);
  const taxRate = 0.08; // 8% sales tax
  const tax = subtotal * taxRate;
  const grandTotal = subtotal + tax;

  // Keypad operations
  const handleKeypadPress = (val: string) => {
    if (val === 'C') {
      setKeypadAmountStr('0');
      return;
    }
    if (val === 'DEL') {
      setKeypadAmountStr((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
      return;
    }
    if (val === '.') {
      if (!keypadAmountStr.includes('.')) {
        setKeypadAmountStr((prev) => prev + '.');
      }
      return;
    }
    // Number input
    setKeypadAmountStr((prev) => {
      if (prev === '0') return val;
      // Cap at 2 decimal places
      const parts = prev.split('.');
      if (parts[1] && parts[1].length >= 2) return prev;
      return prev + val;
    });
  };

  const keypadRawNum = parseFloat(keypadAmountStr) || 0;
  const keypadTipAmount = (keypadRawNum * tipPercent) / 100;
  const keypadTotal = keypadRawNum + keypadTipAmount;

  // Checkout handling
  const handleCheckoutCart = () => {
    if (grandTotal <= 0) return;
    const cartSummary = cart.map((ci) => `${ci.quantity}x ${ci.item.title}`).join(', ');
    const invoice = BTCPayStorageService.createInvoice({
      storeId: activeStore.id,
      amount: Number(grandTotal.toFixed(2)),
      currency: activeStore.defaultCurrency,
      cryptoCurrency: 'BTC-LN',
      itemDesc: `POS: ${cartSummary.substring(0, 100)}`,
      orderId: `POS-${Math.floor(1000 + Math.random() * 9000)}`,
      posCartSummary: cartSummary,
    });
    clearCart();
    onInvoiceCreated(invoice);
  };

  const handleCheckoutKeypad = () => {
    if (keypadTotal <= 0) return;
    const invoice = BTCPayStorageService.createInvoice({
      storeId: activeStore.id,
      amount: Number(keypadTotal.toFixed(2)),
      currency: activeStore.defaultCurrency,
      cryptoCurrency: 'BTC-LN',
      itemDesc: keypadNote || `POS Quick Charge (${formatFiat(keypadTotal, activeStore.defaultCurrency)})`,
      orderId: `KEY-${Math.floor(1000 + Math.random() * 9000)}`,
    });
    setKeypadAmountStr('0');
    setKeypadNote('');
    setTipPercent(0);
    onInvoiceCreated(invoice);
  };

  const handleCreateNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(newItemPrice);
    if (!newItemTitle || isNaN(priceNum) || priceNum <= 0) return;

    const newItem: PosItem = {
      id: `pos_${Date.now()}`,
      title: newItemTitle,
      price: priceNum,
      category: newItemCategory,
      image: newItemEmoji || '⚡',
      inventory: 100,
    };

    BTCPayStorageService.savePosItem(newItem);
    setItems(BTCPayStorageService.getPosItems());
    setShowAddItemModal(false);
    setNewItemTitle('');
    setNewItemPrice('');
  };

  const categories = ['ALL', 'Beverages', 'Food', 'Merch', 'Hardware', 'Digital'];
  const filteredItems = items.filter(
    (item) => activeCategory === 'ALL' || item.category === activeCategory
  );

  return (
    <div className="space-y-6">
      {/* Mode Switcher Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-white/[0.02] border border-white/10 p-3 gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            id="pos-mode-items-btn"
            onClick={() => setPosMode('items')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all ${
              posMode === 'items'
                ? 'bg-orange-500 text-black font-black'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Item Catalog</span>
          </button>
          <button
            id="pos-mode-keypad-btn"
            onClick={() => setPosMode('keypad')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all ${
              posMode === 'keypad'
                ? 'bg-orange-500 text-black font-black'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Keypad Terminal</span>
          </button>
        </div>

        <div className="text-[10px] font-mono tracking-widest text-green-400 uppercase font-bold flex items-center gap-2 border border-green-500/30 bg-green-500/10 px-3 py-1">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          TERMINAL: {activeStore.name.toUpperCase()}
        </div>
      </div>

      {posMode === 'items' ? (
        /* ITEM GRID MODE */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Catalog & Categories */}
          <div className="lg:col-span-2 space-y-4">
            {/* Category Filter Pills & Add Item */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
              <div className="flex items-center gap-1.5 font-mono">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                      activeCategory === cat
                        ? 'bg-orange-500 text-black'
                        : 'bg-white/5 border border-white/10 text-white/40 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <button
                id="add-pos-item-btn"
                onClick={() => setShowAddItemModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 border border-white/20 hover:bg-white hover:text-black text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </button>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredItems.map((item) => {
                const inCart = cart.find((ci) => ci.item.id === item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => addToCart(item)}
                    className="relative p-5 bg-white/[0.03] border border-white/10 hover:border-orange-500/50 hover:bg-white/5 text-left transition-all group flex flex-col justify-between cursor-pointer"
                  >
                    {inCart && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-orange-500 text-black font-black text-xs font-mono flex items-center justify-center">
                        {inCart.quantity}
                      </div>
                    )}
                    <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
                      {item.image}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white uppercase tracking-tight line-clamp-2 leading-snug">
                        {item.title}
                      </div>
                      <div className="text-[10px] font-mono text-white/40 uppercase tracking-wider mt-1">{item.category}</div>
                      <div className="text-sm font-black text-white mt-2 font-mono">
                        {formatFiat(item.price, activeStore.defaultCurrency)}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Col: Live Cart / Cashier Register */}
          <div className="bg-white/[0.03] border border-white/10 p-6 flex flex-col justify-between h-full min-h-[480px]">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-orange-500" />
                  <h3 className="text-xs font-black text-white uppercase tracking-widest font-mono">Current Order</h3>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-[10px] font-mono uppercase font-bold tracking-wider text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear
                  </button>
                )}
              </div>

              {/* Cart Items List */}
              <div className="py-4 space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="text-center py-12 text-white/30 text-xs font-mono uppercase tracking-wider">
                    Tap items on the left to add to cashier cart.
                  </div>
                ) : (
                  cart.map((ci) => (
                    <div
                      key={ci.item.id}
                      className="flex items-center justify-between p-3 bg-white/5 border border-white/10 font-mono"
                    >
                      <div className="flex-1 pr-2 truncate">
                        <div className="text-xs font-bold text-white truncate uppercase">{ci.item.title}</div>
                        <div className="text-[10px] text-white/40">
                          {formatFiat(ci.item.price, activeStore.defaultCurrency)} each
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateQuantity(ci.item.id, -1)}
                          className="w-6 h-6 border border-white/20 hover:bg-white hover:text-black text-white flex items-center justify-center text-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-black text-white">
                          {ci.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(ci.item.id, 1)}
                          className="w-6 h-6 border border-white/20 hover:bg-white hover:text-black text-white flex items-center justify-center text-xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="w-16 text-right text-xs font-bold text-white pl-2">
                        {formatFiat(ci.item.price * ci.quantity, activeStore.defaultCurrency)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Cart Calculation & Charge Button */}
            <div className="border-t border-white/10 pt-4 space-y-2.5 font-mono">
              <div className="flex justify-between text-xs text-white/50 uppercase tracking-wider">
                <span>Subtotal:</span>
                <span>{formatFiat(subtotal, activeStore.defaultCurrency)}</span>
              </div>
              <div className="flex justify-between text-xs text-white/50 uppercase tracking-wider">
                <span>Tax (8%):</span>
                <span>{formatFiat(tax, activeStore.defaultCurrency)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-white uppercase tracking-tight border-t border-white/10 pt-2">
                <span>Total Due:</span>
                <span className="text-orange-400">{formatFiat(grandTotal, activeStore.defaultCurrency)}</span>
              </div>

              <button
                id="pos-charge-customer-btn"
                disabled={cart.length === 0}
                onClick={handleCheckoutCart}
                className="w-full py-4 bg-orange-500 hover:bg-orange-400 disabled:opacity-30 disabled:hover:bg-orange-500 text-black font-black text-xs uppercase tracking-tight flex items-center justify-center gap-2 transition-all cursor-pointer mt-3"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>CHARGE CRYPTO ({formatFiat(grandTotal, activeStore.defaultCurrency)})</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* KEYPAD / NUMPAD MODE */
        <div className="max-w-md mx-auto bg-white/[0.03] border border-white/15 p-6 space-y-6">
          {/* Display screen */}
          <div className="p-6 bg-black border border-white/20 text-right">
            <div className="text-[10px] text-white/40 font-mono uppercase tracking-[0.2em] mb-1">
              Amount Due ({activeStore.defaultCurrency})
            </div>
            <div className="text-5xl font-black text-white font-mono tracking-tighter">
              ${keypadAmountStr}
            </div>
            {tipPercent > 0 && (
              <div className="text-xs text-orange-400 font-mono mt-1 uppercase font-bold tracking-wider">
                + {tipPercent}% Tip ({formatFiat(keypadTipAmount, activeStore.defaultCurrency)}) = Total: {formatFiat(keypadTotal, activeStore.defaultCurrency)}
              </div>
            )}
          </div>

          {/* Tip Presets */}
          <div className="flex items-center gap-2 font-mono">
            {[0, 10, 15, 20, 25].map((pct) => (
              <button
                key={pct}
                onClick={() => setTipPercent(pct)}
                className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                  tipPercent === pct
                    ? 'bg-orange-500 text-black'
                    : 'bg-white/5 text-white/50 hover:text-white border border-white/10'
                }`}
              >
                {pct === 0 ? 'No Tip' : `${pct}%`}
              </button>
            ))}
          </div>

          {/* Optional Note */}
          <input
            type="text"
            placeholder="CUSTOM ORDER / NOTE (OPTIONAL)"
            value={keypadNote}
            onChange={(e) => setKeypadNote(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white/5 border border-white/20 text-xs font-mono text-white placeholder-white/30 uppercase tracking-wider focus:outline-none focus:border-orange-500"
          />

          {/* 4x3 Calculator Keypad */}
          <div className="grid grid-cols-3 gap-2.5">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'DEL'].map((k) => (
              <button
                key={k}
                onClick={() => handleKeypadPress(k)}
                className="py-4 bg-white/5 hover:bg-white/10 active:scale-95 text-white font-black text-xl font-mono border border-white/10 transition-all cursor-pointer"
              >
                {k}
              </button>
            ))}
          </div>

          {/* Charge Button */}
          <button
            id="keypad-charge-btn"
            disabled={keypadTotal <= 0}
            onClick={handleCheckoutKeypad}
            className="w-full py-4 bg-orange-500 hover:bg-orange-400 disabled:opacity-30 disabled:cursor-not-allowed text-black font-black text-xs uppercase tracking-tight flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>GENERATE INVOICE ({formatFiat(keypadTotal, activeStore.defaultCurrency)})</span>
          </button>
        </div>
      )}

      {/* Add New Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0A0A0A] border border-white/20 p-6 space-y-5">
            <h3 className="text-base font-black text-white uppercase tracking-tight font-mono">Add New Catalog Item</h3>
            <form onSubmit={handleCreateNewItem} className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-white/40 block mb-1 uppercase tracking-wider text-[10px]">Item Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nitro Cold Brew"
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/40 block mb-1 uppercase tracking-wider text-[10px]">Price ({activeStore.defaultCurrency})</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="4.99"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-white/40 block mb-1 uppercase tracking-wider text-[10px]">Icon / Emoji</label>
                  <input
                    type="text"
                    value={newItemEmoji}
                    onChange={(e) => setNewItemEmoji(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white text-center text-base focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-white/40 block mb-1 uppercase tracking-wider text-[10px]">Category</label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value as PosItem['category'])}
                  className="w-full px-3 py-2 bg-[#0A0A0A] border border-white/20 text-white focus:outline-none focus:border-orange-500 uppercase"
                >
                  <option value="Beverages">Beverages</option>
                  <option value="Food">Food</option>
                  <option value="Merch">Merch</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Digital">Digital</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddItemModal(false)}
                  className="px-4 py-2 border border-white/20 text-white font-bold uppercase tracking-wider text-xs hover:bg-white hover:text-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-black font-black uppercase tracking-tight text-xs"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
