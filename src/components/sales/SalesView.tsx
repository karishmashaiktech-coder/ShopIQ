import React, { useState } from 'react';
import { 
  Plus, 
  Minus, 
  Search, 
  CheckCircle2, 
  ShoppingBag, 
  CreditCard, 
  Banknote, 
  Sparkles, 
  UserPlus, 
  X,
  Store,
  Receipt
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product, Customer, ShopProfile } from '../../types';

interface SalesViewProps {
  shop: ShopProfile;
  products: Product[];
  customers: Customer[];
  onRecordSale: (saleData: {
    items: { product_id: string; quantity: number }[];
    payment_type: 'PAID' | 'CREDIT';
    payment_method: 'CASH' | 'UPI' | 'CARD' | 'CREDIT';
    customer_id?: string;
    customer_name?: string;
    customer_phone?: string;
    notes?: string;
  }) => boolean;
}

export const SalesView: React.FC<SalesViewProps> = ({
  shop,
  products,
  customers,
  onRecordSale,
}) => {
  const [selectedItems, setSelectedItems] = useState<{ product_id: string; quantity: number }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Step 4: Payment State
  const [paymentType, setPaymentType] = useState<'PAID' | 'CREDIT'>('PAID');
  const [paidMethod, setPaidMethod] = useState<'CASH' | 'UPI' | 'CARD'>('CASH');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [newCustomerName, setNewCustomerName] = useState<string>('');
  const [newCustomerPhone, setNewCustomerPhone] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [isAddingNewCustomer, setIsAddingNewCustomer] = useState(false);

  // Success Celebration State
  const [completedSaleDetails, setCompletedSaleDetails] = useState<{
    totalAmount: number;
    totalProfit: number;
    expectedProfit: number;
    isCredit: boolean;
    customerName: string;
    itemsCount: number;
  } | null>(null);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const addItemToCart = (p: Product) => {
    if (p.current_stock <= 0) return;
    const existing = selectedItems.find(i => i.product_id === p.id);
    if (existing) {
      if (existing.quantity >= p.current_stock) return;
      setSelectedItems(selectedItems.map(i => 
        i.product_id === p.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setSelectedItems([...selectedItems, { product_id: p.id, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    setSelectedItems(prev => {
      return prev.map(item => {
        if (item.product_id === productId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          if (newQty > prod.current_stock) return item;
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean) as { product_id: string; quantity: number }[];
    });
  };

  // Calculations for Step 3
  const cartDetails = selectedItems.map(item => {
    const prod = products.find(p => p.id === item.product_id)!;
    const itemTotal = prod ? prod.selling_price * item.quantity : 0;
    const itemCost = prod ? prod.cost_price * item.quantity : 0;
    const itemProfit = itemTotal - itemCost;
    return {
      ...item,
      product: prod,
      total: itemTotal,
      cost: itemCost,
      profit: itemProfit,
    };
  }).filter(item => Boolean(item.product));

  const totalSaleAmount = cartDetails.reduce((sum, i) => sum + i.total, 0);
  const totalCostAmount = cartDetails.reduce((sum, i) => sum + i.cost, 0);
  const totalEarnedAmount = totalSaleAmount - totalCostAmount;

  const handleCompleteSale = () => {
    if (selectedItems.length === 0) return;

    let customerId: string | undefined = undefined;
    let customerName = '';
    let customerPhone = '';

    if (paymentType === 'CREDIT') {
      if (isAddingNewCustomer) {
        if (!newCustomerName.trim()) {
          alert('Please enter the customer name for credit.');
          return;
        }
        customerId = undefined;
        customerName = newCustomerName.trim();
        customerPhone = newCustomerPhone.trim();
      } else {
        if (!selectedCustomerId) {
          alert('Please select a customer for credit / udhaar.');
          return;
        }
        const existingCust = customers.find(c => c.id === selectedCustomerId);
        customerId = selectedCustomerId;
        customerName = existingCust?.name || 'Credit Customer';
        customerPhone = existingCust?.phone || '';
      }
    }

    const success = onRecordSale({
      items: selectedItems,
      payment_type: paymentType,
      payment_method: paymentType === 'CREDIT' ? 'CREDIT' : paidMethod,
      customer_id: isAddingNewCustomer ? undefined : (customerId || undefined),
      customer_name: customerName,
      customer_phone: customerPhone,
      notes: dueDate ? `Due by ${dueDate}` : undefined,
    });

    if (success) {
      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
        });
      } catch (e) {}

      setCompletedSaleDetails({
        totalAmount: totalSaleAmount,
        totalProfit: paymentType === 'CREDIT' ? 0 : totalEarnedAmount,
        expectedProfit: totalEarnedAmount,
        isCredit: paymentType === 'CREDIT',
        customerName: customerName,
        itemsCount: selectedItems.reduce((s, i) => s + i.quantity, 0),
      });

      // Clear customer input fields
      setNewCustomerName('');
      setNewCustomerPhone('');
      setIsAddingNewCustomer(false);
      setSelectedCustomerId('');
      setDueDate('');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <ShoppingBag className="w-7 h-7 text-emerald-400" />
            <span>New Sale</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Choose what the customer bought, select payment method, and complete sale
          </p>
        </div>
      </div>

      {completedSaleDetails ? (
        <div className="p-8 sm:p-12 rounded-2xl bg-[#121422] border border-emerald-500/30 text-center flex flex-col items-center justify-center space-y-6 max-w-lg mx-auto shadow-2xl">
          <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-950/50">
            <CheckCircle2 className="w-12 h-12 animate-bounce" />
          </div>

          <div>
            <span className="text-sm font-bold text-emerald-400 uppercase tracking-widest">
              Success
            </span>
            <h3 className="text-3xl sm:text-4xl font-black text-white mt-1">
              Sale recorded! 🎉
            </h3>
            <p className="text-slate-300 text-sm mt-2">
              {completedSaleDetails.isCredit
                ? `Added to ${completedSaleDetails.customerName}'s Udhaar ledger.`
                : 'Your inventory and earnings updated automatically.'}
            </p>
          </div>

          <div className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 font-mono text-sm">
            <div className="flex justify-between items-center text-slate-300">
              <span>Total Sale:</span>
              <span className="text-xl font-bold text-white">
                {shop.currency_symbol}{completedSaleDetails.totalAmount.toLocaleString()}
              </span>
            </div>
            
            {completedSaleDetails.isCredit ? (
              <>
                <div className="flex justify-between items-center text-amber-400 border-t border-white/5 pt-2">
                  <span>Realized Earnings:</span>
                  <span className="text-xl font-bold">
                    {shop.currency_symbol}0
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 text-left bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 font-sans">
                  💡 Profit of +{shop.currency_symbol}{completedSaleDetails.expectedProfit.toLocaleString()} is saved internally and will be added to earnings once {completedSaleDetails.customerName} clears the credit balance in full.
                </div>
              </>
            ) : (
              <div className="flex justify-between items-center text-emerald-400 border-t border-white/5 pt-2">
                <span>You earned:</span>
                <span className="text-xl font-bold">
                  +{shop.currency_symbol}{completedSaleDetails.totalProfit.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setSelectedItems([]);
              setCompletedSaleDetails(null);
            }}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/40 transition-all"
          >
            + Start Next Sale
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Step 1 - Choose Products */}
          <div className="lg:col-span-7 p-5 rounded-2xl bg-[#121422] border border-white/10 flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Step 1: Choose what the customer bought
              </span>
              <span className="text-xs text-slate-400">
                {filteredProducts.length} items available
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products by name or category..."
                className="w-full bg-[#080911] border border-white/10 focus:border-purple-500 rounded-xl pl-10 pr-3 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none"
              />
            </div>

            {/* Category Chips */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === c
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto max-h-[500px] pr-1">
              {filteredProducts.map((p) => {
                const inCart = selectedItems.find(i => i.product_id === p.id);
                const isOutOfStock = p.current_stock <= 0;

                return (
                  <button
                    key={p.id}
                    disabled={isOutOfStock}
                    onClick={() => addItemToCart(p)}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                      isOutOfStock 
                        ? 'opacity-40 bg-white/5 border-transparent cursor-not-allowed'
                        : inCart
                        ? 'bg-purple-600/15 border-purple-500 shadow-md shadow-purple-950/30'
                        : 'bg-[#141624] border-white/5 hover:border-purple-500/40'
                    }`}
                  >
                    {inCart && (
                      <span className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center font-mono">
                        {inCart.quantity}
                      </span>
                    )}
                    <div>
                      <h4 className="font-bold text-white text-xs sm:text-sm line-clamp-2">
                        {p.name}
                      </h4>
                      <span className="text-[11px] text-slate-400 block mt-1">
                        {p.current_stock} {p.unit_type || 'units'} in stock
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between font-mono">
                      <span className="font-bold text-white text-sm">
                        {shop.currency_symbol}{p.selling_price}
                      </span>
                      <span className="text-xs font-semibold text-emerald-400">
                        +{shop.currency_symbol}{p.selling_price - p.cost_price}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Step 2, 3, 4 - Basket, Instant Calculation, and Payment */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-[#121422] border border-white/10 flex flex-col justify-between space-y-5">
            <div>
              {/* Heading */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                  Step 2: How many?
                </span>
                <span className="text-xs font-mono font-bold text-white">
                  {selectedItems.reduce((s, i) => s + i.quantity, 0)} items in basket
                </span>
              </div>

              {/* Items List with +/- Selector */}
              {selectedItems.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs border border-dashed border-white/10 rounded-2xl p-6 mt-4">
                  Tap any product on the left to add items to this sale.
                </div>
              ) : (
                <div className="space-y-2.5 mt-3 max-h-56 overflow-y-auto pr-1">
                  {cartDetails.map(({ product_id, quantity, product, total, profit }) => (
                    <div
                      key={product_id}
                      className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold text-white text-xs sm:text-sm truncate">
                          {product.name}
                        </h5>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {shop.currency_symbol}{product.selling_price} each
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(product_id, -1)}
                          className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center font-mono font-bold text-sm text-white">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product_id, 1)}
                          className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right font-mono min-w-[60px]">
                        <span className="font-bold text-white text-sm block">
                          {shop.currency_symbol}{total}
                        </span>
                        <span className="text-[11px] text-emerald-400 font-semibold">
                          +{shop.currency_symbol}{profit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Step 3: Calculation (Prompt Section 9) */}
              {selectedItems.length > 0 && (
                <div className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 to-[#141624] border border-purple-500/30 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="font-semibold">Total Sale Amount:</span>
                    <span className="font-mono font-bold text-white text-base">
                      {shop.currency_symbol}{totalSaleAmount}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 pt-1 border-t border-white/5">
                    You spent about <strong className="text-slate-200">{shop.currency_symbol}{totalCostAmount}</strong> on these products.
                  </div>

                  <div className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 pt-0.5">
                    <Sparkles className="w-4 h-4" />
                    <span>You earned {shop.currency_symbol}{totalEarnedAmount} from this sale.</span>
                  </div>
                </div>
              )}

              {/* Step 4: Payment Choice */}
              <div className="mt-5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5">
                  Step 4: How did the customer pay?
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentType('PAID')}
                    className={`p-3.5 rounded-2xl border flex flex-col items-center gap-1 font-bold text-xs transition-all ${
                      paymentType === 'PAID'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-lg shadow-emerald-950/30'
                        : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-emerald-400" />
                    <span>💵 Paid now</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentType('CREDIT')}
                    className={`p-3.5 rounded-2xl border flex flex-col items-center gap-1 font-bold text-xs transition-all ${
                      paymentType === 'CREDIT'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-lg shadow-amber-950/30'
                        : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-amber-400" />
                    <span>💳 Credit / Udhaar</span>
                  </button>
                </div>

                {paymentType === 'PAID' ? (
                  <div className="flex gap-2 mt-3">
                    {(['CASH', 'UPI', 'CARD'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setPaidMethod(m)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                          paidMethod === m
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'bg-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-300">Select Udhaar Customer:</span>
                      <button
                        type="button"
                        onClick={() => setIsAddingNewCustomer(!isAddingNewCustomer)}
                        className="text-[11px] font-semibold text-purple-400 hover:text-purple-300"
                      >
                        {isAddingNewCustomer ? 'Choose Existing' : '+ New Customer'}
                      </button>
                    </div>

                    {isAddingNewCustomer ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={newCustomerName}
                          onChange={(e) => setNewCustomerName(e.target.value)}
                          placeholder="Customer Name *"
                          className="w-full bg-[#090A0F] border border-white/10 rounded-xl px-3 py-2 text-white placeholder:text-slate-600"
                        />
                        <input
                          type="text"
                          value={newCustomerPhone}
                          onChange={(e) => setNewCustomerPhone(e.target.value)}
                          placeholder="Phone / WhatsApp Number"
                          className="w-full bg-[#090A0F] border border-white/10 rounded-xl px-3 py-2 text-white placeholder:text-slate-600"
                        />
                      </div>
                    ) : (
                      <select
                        value={selectedCustomerId}
                        onChange={(e) => setSelectedCustomerId(e.target.value)}
                        className="w-full bg-[#090A0F] border border-white/10 text-white rounded-xl px-3 py-2 outline-none"
                      >
                        <option value="">-- Choose Customer --</option>
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} (Owes {shop.currency_symbol}{c.current_balance})
                          </option>
                        ))}
                      </select>
                    )}

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Due Date (Optional):</label>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full bg-[#090A0F] border border-white/10 text-white rounded-xl px-3 py-1.5"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Complete Sale Button */}
            <button
              disabled={selectedItems.length === 0}
              onClick={handleCompleteSale}
              className={`w-full py-4 rounded-2xl font-bold text-sm sm:text-base shadow-xl transition-all flex items-center justify-center gap-2 ${
                selectedItems.length === 0
                  ? 'bg-white/10 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 text-white shadow-emerald-950/40 hover:scale-[1.01]'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Complete Sale ({shop.currency_symbol}{totalSaleAmount})</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
