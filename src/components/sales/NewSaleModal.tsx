import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Minus, 
  Search, 
  Trash2, 
  CheckCircle2, 
  ShoppingBag, 
  CreditCard, 
  Banknote, 
  Sparkles, 
  UserPlus,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product, Customer, ShopProfile } from '../../types';

interface NewSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
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

export const NewSaleModal: React.FC<NewSaleModalProps> = ({
  isOpen,
  onClose,
  shop,
  products,
  customers,
  onRecordSale,
}) => {
  // Cart items
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

  if (!isOpen) return null;

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Cart operations
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

  const removeItemFromCart = (productId: string) => {
    setSelectedItems(selectedItems.filter(i => i.product_id !== productId));
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
      // Fire celebratory confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
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

  const handleResetAndClose = () => {
    setSelectedItems([]);
    setSearchTerm('');
    setPaymentType('PAID');
    setPaidMethod('CASH');
    setSelectedCustomerId('');
    setNewCustomerName('');
    setNewCustomerPhone('');
    setIsAddingNewCustomer(false);
    setDueDate('');
    setCompletedSaleDetails(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-md" 
        onClick={handleResetAndClose} 
      />

      {/* Main Container */}
      <div className="relative w-full max-w-4xl bg-[#10121E] border border-white/10 rounded-2xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#0C0E18]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                New Sale
              </h2>
              <p className="text-xs text-slate-400">
                Fast billing with instant earnings calculation
              </p>
            </div>
          </div>

          <button 
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Modal Overlay when Sale Completed */}
        {completedSaleDetails ? (
          <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-6 my-auto">
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
                  ? `Recorded in ${completedSaleDetails.customerName}'s Udhaar ledger.`
                  : 'Stock updated and metrics synchronized automatically.'}
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="w-full max-w-sm p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3 font-mono text-sm">
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
                    💡 Expected profit: +{shop.currency_symbol}{completedSaleDetails.expectedProfit.toLocaleString()}. Profit is recognized when {completedSaleDetails.customerName} clears the credit balance in full.
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

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm">
              <button
                onClick={() => {
                  setSelectedItems([]);
                  setCompletedSaleDetails(null);
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/40 transition-all"
              >
                + Make Another Sale
              </button>
              <button
                onClick={handleResetAndClose}
                className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-sm transition-all"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Split View: Left (Pick Products) & Right (Cart & Payment) */
          <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
            
            {/* LEFT COLUMN: Step 1 - Choose Products (7 cols) */}
            <div className="md:col-span-7 p-4 sm:p-5 flex flex-col border-b md:border-b-0 md:border-r border-white/10 overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                  Step 1: Choose what the customer bought
                </span>
                <span className="text-[11px] text-slate-400">
                  {filteredProducts.length} items
                </span>
              </div>

              {/* Search & Filter */}
              <div className="space-y-2 mb-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search product..."
                    className="w-full bg-[#080911] border border-white/10 focus:border-purple-500 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder:text-slate-600 outline-none"
                  />
                </div>

                {/* Category Chips */}
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedCategory(c)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                        selectedCategory === c
                          ? 'bg-purple-600 text-white'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 overflow-y-auto max-h-72 sm:max-h-96 pr-1">
                {filteredProducts.map((p) => {
                  const inCart = selectedItems.find(i => i.product_id === p.id);
                  const isOutOfStock = p.current_stock <= 0;

                  return (
                    <button
                      key={p.id}
                      disabled={isOutOfStock}
                      onClick={() => addItemToCart(p)}
                      className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                        isOutOfStock 
                          ? 'opacity-40 bg-white/5 border-transparent cursor-not-allowed'
                          : inCart
                          ? 'bg-purple-600/15 border-purple-500 shadow-md shadow-purple-950/30'
                          : 'bg-[#141624] border-white/5 hover:border-purple-500/40'
                      }`}
                    >
                      {inCart && (
                        <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center font-mono">
                          {inCart.quantity}
                        </span>
                      )}
                      <div>
                        <h4 className="font-bold text-white text-xs sm:text-sm line-clamp-2">
                          {p.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {p.current_stock} {p.unit_type || 'units'} left
                        </span>
                      </div>
                      <div className="mt-2.5 flex items-center justify-between font-mono">
                        <span className="font-bold text-white text-xs sm:text-sm">
                          {shop.currency_symbol}{p.selling_price}
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-400">
                          +{shop.currency_symbol}{p.selling_price - p.cost_price}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* RIGHT COLUMN: Step 2, 3, 4 - Cart, Calculations & Payment (5 cols) */}
            <div className="md:col-span-5 p-4 sm:p-5 flex flex-col justify-between bg-[#0C0E18] overflow-y-auto">
              <div>
                {/* Cart Items Heading */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                    Step 2: Selected items
                  </span>
                  <span className="text-xs font-mono font-bold text-white">
                    {selectedItems.reduce((s, i) => s + i.quantity, 0)} items
                  </span>
                </div>

                {/* Items List with Quantity Controls (+/-) */}
                {selectedItems.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-xs border border-dashed border-white/10 rounded-xl p-4">
                    Tap any product on the left to add it to this sale.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {cartDetails.map(({ product_id, quantity, product, total, profit }) => (
                      <div
                        key={product_id}
                        className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between gap-2"
                      >
                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold text-white text-xs truncate">
                            {product.name}
                          </h5>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {shop.currency_symbol}{product.selling_price} each
                          </span>
                        </div>

                        {/* Quantity Selector with + and - */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateQuantity(product_id, -1)}
                            className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-5 text-center font-mono font-bold text-xs text-white">
                            {quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(product_id, 1)}
                            className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right font-mono min-w-[50px]">
                          <span className="font-bold text-white text-xs block">
                            {shop.currency_symbol}{total}
                          </span>
                          <span className="text-[10px] text-emerald-400">
                            +{shop.currency_symbol}{profit}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Step 3: Clear Human Calculations (Prompt Section 9) */}
                {selectedItems.length > 0 && (
                  <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-br from-purple-950/40 to-[#121422] border border-purple-500/30 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Total Selling Price:</span>
                      <span className="font-mono font-bold text-white text-sm">
                        {shop.currency_symbol}{totalSaleAmount}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 pt-1 border-t border-white/5">
                      You spent about <strong className="text-slate-200">{shop.currency_symbol}{totalCostAmount}</strong> on these products.
                    </div>

                    <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 pt-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>You earned {shop.currency_symbol}{totalEarnedAmount} from this sale.</span>
                    </div>
                  </div>
                )}

                {/* Step 4: Payment Method (Prompt Section 9) */}
                <div className="mt-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    How did the customer pay?
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentType('PAID')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1 font-bold text-xs transition-all ${
                        paymentType === 'PAID'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-md'
                          : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                      }`}
                    >
                      <Banknote className="w-5 h-5 text-emerald-400" />
                      <span>💵 Paid now</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentType('CREDIT')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1 font-bold text-xs transition-all ${
                        paymentType === 'CREDIT'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-md'
                          : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 text-amber-400" />
                      <span>💳 Credit / Udhaar</span>
                    </button>
                  </div>

                  {/* If Paid Now: Pick Mode */}
                  {paymentType === 'PAID' ? (
                    <div className="flex gap-2 mt-2">
                      {(['CASH', 'UPI', 'CARD'] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setPaidMethod(m)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            paidMethod === m
                              ? 'bg-purple-600 text-white'
                              : 'bg-white/5 text-slate-400 hover:text-white'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  ) : (
                    /* If Credit: Pick or Create Customer */
                    <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-300">Customer for Udhaar:</span>
                        <button
                          type="button"
                          onClick={() => setIsAddingNewCustomer(!isAddingNewCustomer)}
                          className="text-[11px] font-semibold text-purple-400 hover:text-purple-300"
                        >
                          {isAddingNewCustomer ? 'Select Existing' : '+ New Customer'}
                        </button>
                      </div>

                      {isAddingNewCustomer ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={newCustomerName}
                            onChange={(e) => setNewCustomerName(e.target.value)}
                            placeholder="Customer Name *"
                            className="w-full bg-[#090A0F] border border-white/10 rounded-lg px-2.5 py-1.5 text-white placeholder:text-slate-600"
                          />
                          <input
                            type="text"
                            value={newCustomerPhone}
                            onChange={(e) => setNewCustomerPhone(e.target.value)}
                            placeholder="Phone / WhatsApp Number"
                            className="w-full bg-[#090A0F] border border-white/10 rounded-lg px-2.5 py-1.5 text-white placeholder:text-slate-600"
                          />
                        </div>
                      ) : (
                        <select
                          value={selectedCustomerId}
                          onChange={(e) => setSelectedCustomerId(e.target.value)}
                          className="w-full bg-[#090A0F] border border-white/10 text-white rounded-lg px-2.5 py-1.5 outline-none"
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
                        <label className="text-[10px] text-slate-400 block mb-0.5">Due Date (Optional):</label>
                        <input
                          type="date"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          className="w-full bg-[#090A0F] border border-white/10 text-white rounded-lg px-2.5 py-1"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Complete Sale Button */}
              <div className="mt-5 pt-3 border-t border-white/10">
                <button
                  disabled={selectedItems.length === 0}
                  onClick={handleCompleteSale}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2 ${
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

          </div>
        )}
      </div>
    </div>
  );
};
