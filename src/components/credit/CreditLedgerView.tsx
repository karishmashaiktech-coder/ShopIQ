import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  CreditCard, 
  Clock, 
  Search, 
  CheckCircle2, 
  MessageSquare, 
  Phone, 
  AlertCircle, 
  ArrowDownRight, 
  X, 
  DollarSign,
  Share2,
  Calendar
} from 'lucide-react';
import { Customer, ShopProfile, CreditPayment } from '../../types';

interface CreditLedgerViewProps {
  shop: ShopProfile;
  customers: Customer[];
  onAddCustomer: (c: Partial<Customer>) => boolean;
  onRecordPayment: (p: { customer_id: string; amount: number; payment_method: 'CASH' | 'UPI' | 'BANK_TRANSFER'; notes?: string }) => boolean;
  onRecordCreditSale?: (sale: any) => boolean;
}

export const CreditLedgerView: React.FC<CreditLedgerViewProps> = ({
  shop,
  customers,
  onAddCustomer,
  onRecordPayment,
  onRecordCreditSale,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ACTIVE' | 'ALL' | 'CLEARED'>('ACTIVE');

  // Modals
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isGiveCreditOpen, setIsGiveCreditOpen] = useState(false);
  const [selectedCustomerForPayment, setSelectedCustomerForPayment] = useState<Customer | null>(null);
  const [selectedCustomerDetails, setSelectedCustomerDetails] = useState<Customer | null>(null);

  // Add Customer Form state
  const [newCustData, setNewCustData] = useState({
    name: '',
    phone: '',
    initial_credit: 0,
    due_date: '',
    notes: '',
  });

  // Give Credit Form state
  const [giveCreditData, setGiveCreditData] = useState({
    customer_id: '',
    new_customer_name: '',
    new_customer_phone: '',
    amount: 0,
    notes: '',
    due_date: '',
  });

  // Record Payment Form state
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI' | 'BANK_TRANSFER'>('UPI');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentError, setPaymentError] = useState('');

  // Calculations
  const owingCustomers = customers.filter(c => c.current_balance > 0);
  const clearedCustomers = customers.filter(c => c.current_balance === 0);
  const totalMoneyOwed = owingCustomers.reduce((sum, c) => sum + c.current_balance, 0);

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'ACTIVE') {
      return matchesSearch && c.current_balance > 0;
    }
    if (statusFilter === 'CLEARED') {
      return matchesSearch && c.current_balance === 0;
    }
    return matchesSearch;
  });

  const handleOpenPayment = (c: Customer) => {
    setSelectedCustomerForPayment(c);
    setPaymentAmount(c.current_balance);
    setPaymentError('');
    setPaymentNotes('');
  };

  const handleOpenGiveCredit = (c?: Customer) => {
    if (c) {
      setGiveCreditData({
        customer_id: c.id,
        new_customer_name: '',
        new_customer_phone: '',
        amount: 0,
        notes: '',
        due_date: c.due_date || '',
      });
    } else {
      setGiveCreditData({
        customer_id: customers.length > 0 ? customers[0].id : 'NEW',
        new_customer_name: '',
        new_customer_phone: '',
        amount: 0,
        notes: '',
        due_date: '',
      });
    }
    setIsGiveCreditOpen(true);
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerForPayment) return;

    if (paymentAmount <= 0) {
      setPaymentError('Payment amount must be greater than 0.');
      return;
    }

    if (paymentAmount > selectedCustomerForPayment.current_balance) {
      setPaymentError(`Cannot pay more than the owed balance of ${shop.currency_symbol}${selectedCustomerForPayment.current_balance}.`);
      return;
    }

    const success = onRecordPayment({
      customer_id: selectedCustomerForPayment.id,
      amount: Number(paymentAmount),
      payment_method: paymentMethod,
      notes: paymentNotes || 'Partial or full udhaar settlement',
    });

    if (success) {
      setSelectedCustomerForPayment(null);
    }
  };

  const handleSaveGiveCredit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(giveCreditData.amount);
    if (!amountNum || amountNum <= 0) {
      alert('Please enter a valid credit amount.');
      return;
    }

    if (giveCreditData.customer_id === 'NEW' || (!giveCreditData.customer_id && giveCreditData.new_customer_name)) {
      if (!giveCreditData.new_customer_name.trim()) {
        alert('Please enter customer name.');
        return;
      }
      const success = onAddCustomer({
        name: giveCreditData.new_customer_name.trim(),
        phone: giveCreditData.new_customer_phone.trim(),
        current_balance: amountNum,
        total_credit_given: amountNum,
        due_date: giveCreditData.due_date || undefined,
      });
      if (success) {
        setIsGiveCreditOpen(false);
      }
    } else {
      if (!giveCreditData.customer_id) {
        alert('Please select a customer.');
        return;
      }
      if (onRecordCreditSale) {
        const success = onRecordCreditSale({
          customer_id: giveCreditData.customer_id,
          amount: amountNum,
          notes: giveCreditData.notes ? `${giveCreditData.notes}${giveCreditData.due_date ? ` (Due: ${giveCreditData.due_date})` : ''}` : (giveCreditData.due_date ? `Due by ${giveCreditData.due_date}` : 'Credit purchase'),
        });
        if (success) {
          setIsGiveCreditOpen(false);
        }
      }
    }
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustData.name.trim()) {
      alert('Please enter customer name.');
      return;
    }

    const success = onAddCustomer({
      name: newCustData.name.trim(),
      phone: newCustData.phone.trim(),
      current_balance: Number(newCustData.initial_credit || 0),
      total_credit_given: Number(newCustData.initial_credit || 0),
      due_date: newCustData.due_date || undefined,
    });

    if (success) {
      setIsAddCustomerOpen(false);
      setNewCustData({
        name: '',
        phone: '',
        initial_credit: 0,
        due_date: '',
        notes: '',
      });
    }
  };

  // WhatsApp Reminder message builder
  const generateWhatsAppUrl = (c: Customer) => {
    const text = `Namaste ${c.name} ji 🙏\n\nThis is a friendly payment reminder from *${shop.shop_name}*.\n\nYour pending credit (Udhaar) balance is *${shop.currency_symbol}${c.current_balance.toLocaleString()}*.\nDue Date: ${c.due_date || 'Due Soon'}.\n\nPlease clear the balance via UPI or cash during your next visit.\nThank you!`;
    const cleanPhone = c.phone.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-7 h-7 text-amber-400" />
            <span>Credit / Udhaar</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Money customers still need to pay you
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleOpenGiveCredit()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 text-white text-xs sm:text-sm font-bold shadow-xl shadow-amber-950/40 transition-all hover:scale-[1.02]"
          >
            <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>+ Give Udhaar (Credit)</span>
          </button>
          <button
            onClick={() => setIsAddCustomerOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-bold border border-white/10 transition-all"
          >
            <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>+ Add Customer</span>
          </button>
        </div>
      </div>

      {/* 2 Summary Cards (Prompt Section 10) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 sm:p-6 rounded-2xl bg-[#121422] border border-amber-500/20 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-300">Total Money Owed</span>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
              {shop.currency_symbol}{totalMoneyOwed.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Pending across customer accounts
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-[#121422] border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-300">Customers Who Owe Money</span>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
              {owingCustomers.length} <span className="text-sm font-normal text-slate-400">customers</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {customers.length} total registered customers
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#121422] border border-white/10 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search customer by name or phone..."
            className="w-full bg-[#090A0F] border border-white/10 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'ACTIVE'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/40'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            Active Udhaar ({owingCustomers.length})
          </button>
          <button
            onClick={() => setStatusFilter('CLEARED')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'CLEARED'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            Cleared ({clearedCustomers.length})
          </button>
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'ALL'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/40'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            All Directory ({customers.length})
          </button>
        </div>
      </div>

      {/* Customer Cards Grid (Prompt Section 10) */}
      {filteredCustomers.length === 0 ? (
        <div className="py-16 p-6 rounded-2xl bg-[#121422] border border-white/10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No customers found</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto mt-1">
            Add customers to track who bought on credit and who still owes money.
          </p>
          <button
            onClick={() => setIsAddCustomerOpen(true)}
            className="mt-5 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all inline-flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Customer</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((cust) => {
            const hasDue = cust.current_balance > 0;
            const isOverdue = cust.status === 'OVERDUE';

            return (
              <div
                key={cust.id}
                className={`p-5 rounded-2xl bg-[#121422] border transition-all flex flex-col justify-between hover:border-amber-500/40 ${
                  isOverdue 
                    ? 'border-rose-500/30 shadow-lg shadow-rose-950/20' 
                    : hasDue 
                    ? 'border-amber-500/20' 
                    : 'border-white/10'
                }`}
              >
                <div>
                  {/* Header & Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <h3 className="text-base font-bold text-white tracking-tight">
                      {cust.name}
                    </h3>

                    {isOverdue ? (
                      <span className="text-[11px] font-bold text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/30">
                        🔴 Overdue
                      </span>
                    ) : hasDue ? (
                      <span className="text-[11px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                        🟡 Pending
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        🟢 Clear
                      </span>
                    )}
                  </div>

                  {/* Phone number */}
                  {cust.phone && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{cust.phone}</span>
                    </div>
                  )}

                  {/* Balance Details */}
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Owes:</span>
                      <span className={`font-mono font-bold text-base ${hasDue ? 'text-amber-300' : 'text-emerald-400'}`}>
                        {shop.currency_symbol}{cust.current_balance.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-white/5">
                      <span className="text-slate-400">Due Date:</span>
                      <span className="text-slate-200 font-medium">
                        {cust.due_date || 'Due Soon'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Buttons (Prompt Section 10) */}
                <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenGiveCredit(cust)}
                      className="flex-1 py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>+ Add Udhaar</span>
                    </button>

                    {hasDue && (
                      <button
                        onClick={() => handleOpenPayment(cust)}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Record Payment</span>
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedCustomerDetails(cust)}
                      className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-all"
                    >
                      Details
                    </button>
                  </div>

                  {/* WhatsApp Reminder Button */}
                  {hasDue && cust.phone && (
                    <a
                      href={generateWhatsAppUrl(cust)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-1.5 px-3 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Send WhatsApp Reminder</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Record Payment Modal (Prompt Section 10) */}
      {selectedCustomerForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm" 
            onClick={() => setSelectedCustomerForPayment(null)} 
          />
          <div className="relative w-full max-w-md bg-[#121422] border border-emerald-500/30 rounded-2xl p-6 shadow-2xl z-10">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Record Customer Payment
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Customer: <strong className="text-white">{selectedCustomerForPayment.name}</strong>
                </p>
              </div>
              <button 
                onClick={() => setSelectedCustomerForPayment(null)} 
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-4 mt-5">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs flex justify-between items-center">
                <span className="text-amber-300 font-semibold">Total currently owed:</span>
                <span className="font-mono font-bold text-amber-200 text-sm">
                  {shop.currency_symbol}{selectedCustomerForPayment.current_balance.toLocaleString()}
                </span>
              </div>

              {paymentError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{paymentError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  How much did they pay? ({shop.currency_symbol}) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedCustomerForPayment.current_balance}
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full bg-[#090A0F] border border-white/10 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-base font-bold text-white font-mono outline-none"
                />
              </div>

              {/* Quick Amount Buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentAmount(selectedCustomerForPayment.current_balance)}
                  className="flex-1 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold"
                >
                  Pay Full ({shop.currency_symbol}{selectedCustomerForPayment.current_balance})
                </button>
                {selectedCustomerForPayment.current_balance > 500 && (
                  <button
                    type="button"
                    onClick={() => setPaymentAmount(Math.round(selectedCustomerForPayment.current_balance / 2))}
                    className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
                  >
                    Pay Half (50%)
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['UPI', 'CASH', 'BANK_TRANSFER'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        paymentMethod === m
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g. Paid via PhonePe / Google Pay"
                  className="w-full bg-[#090A0F] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setSelectedCustomerForPayment(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 rounded-xl shadow-lg shadow-emerald-900/40"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Customer Modal */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm" 
            onClick={() => setIsAddCustomerOpen(false)} 
          />
          <div className="relative w-full max-w-md bg-[#121422] border border-amber-500/30 rounded-2xl p-6 shadow-2xl z-10">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-400" />
                Add Customer
              </h3>
              <button 
                onClick={() => setIsAddCustomerOpen(false)} 
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCustData.name}
                  onChange={(e) => setNewCustData({ ...newCustData, name: e.target.value })}
                  placeholder="e.g. Rahul Verma"
                  className="w-full bg-[#090A0F] border border-white/10 focus:border-amber-500 rounded-xl px-3.5 py-2 text-sm text-white placeholder:text-slate-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Phone / WhatsApp Number
                </label>
                <input
                  type="text"
                  value={newCustData.phone}
                  onChange={(e) => setNewCustData({ ...newCustData, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-[#090A0F] border border-white/10 focus:border-amber-500 rounded-xl px-3.5 py-2 text-sm text-white placeholder:text-slate-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Initial Credit ({shop.currency_symbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newCustData.initial_credit}
                    onChange={(e) => setNewCustData({ ...newCustData, initial_credit: Number(e.target.value) })}
                    className="w-full bg-[#090A0F] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newCustData.due_date}
                    onChange={(e) => setNewCustData({ ...newCustData, due_date: e.target.value })}
                    className="w-full bg-[#090A0F] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 rounded-xl shadow-lg shadow-amber-900/40"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Details Modal */}
      {selectedCustomerDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm" 
            onClick={() => setSelectedCustomerDetails(null)} 
          />
          <div className="relative w-full max-w-md bg-[#121422] border border-white/10 rounded-2xl p-6 shadow-2xl z-10">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-base font-bold text-white">
                Customer Details
              </h3>
              <button 
                onClick={() => setSelectedCustomerDetails(null)} 
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-slate-400">Name:</span>
                <span className="font-bold text-white">{selectedCustomerDetails.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-slate-400">Phone:</span>
                <span className="font-mono text-white">{selectedCustomerDetails.phone || 'Not provided'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-slate-400">Current Owed Amount:</span>
                <span className="font-mono font-bold text-amber-300">
                  {shop.currency_symbol}{selectedCustomerDetails.current_balance.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-slate-400">Due Date:</span>
                <span className="text-slate-200">{selectedCustomerDetails.due_date || 'Due Soon'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400">Status:</span>
                <span className="font-bold text-white">{selectedCustomerDetails.status}</span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  const target = selectedCustomerDetails;
                  setSelectedCustomerDetails(null);
                  handleOpenGiveCredit(target);
                }}
                className="px-4 py-2 text-xs font-bold text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-xl"
              >
                + Give Udhaar
              </button>

              <div className="flex gap-2">
                {selectedCustomerDetails.current_balance > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const target = selectedCustomerDetails;
                      setSelectedCustomerDetails(null);
                      handleOpenPayment(target);
                    }}
                    className="px-4 py-2 text-xs font-bold text-emerald-300 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-xl"
                  >
                    Record Payment
                  </button>
                )}
                <button
                  onClick={() => setSelectedCustomerDetails(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Give Udhaar / Add Credit Modal */}
      {isGiveCreditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm" 
            onClick={() => setIsGiveCreditOpen(false)} 
          />
          <div className="relative w-full max-w-md bg-[#121422] border border-amber-500/30 rounded-2xl p-6 shadow-2xl z-10">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-400" />
                Give Udhaar / Add Credit
              </h3>
              <button 
                onClick={() => setIsGiveCreditOpen(false)} 
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGiveCredit} className="space-y-4 mt-5">
              {/* Customer Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Customer *
                </label>
                <select
                  value={giveCreditData.customer_id}
                  onChange={(e) => setGiveCreditData({ ...giveCreditData, customer_id: e.target.value })}
                  className="w-full bg-[#090A0F] border border-white/10 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.current_balance > 0 ? `(Owes: ${shop.currency_symbol}${c.current_balance})` : ''}
                    </option>
                  ))}
                  <option value="NEW">+ Add New Customer for Udhaar</option>
                </select>
              </div>

              {/* If New Customer Selected */}
              {giveCreditData.customer_id === 'NEW' && (
                <div className="space-y-3 p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      New Customer Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={giveCreditData.new_customer_name}
                      onChange={(e) => setGiveCreditData({ ...giveCreditData, new_customer_name: e.target.value })}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full bg-[#090A0F] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={giveCreditData.new_customer_phone}
                      onChange={(e) => setGiveCreditData({ ...giveCreditData, new_customer_phone: e.target.value })}
                      placeholder="e.g. 9876543210"
                      className="w-full bg-[#090A0F] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Credit Amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Udhaar / Credit Amount ({shop.currency_symbol}) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={giveCreditData.amount || ''}
                  onChange={(e) => setGiveCreditData({ ...giveCreditData, amount: Number(e.target.value) })}
                  placeholder="0"
                  className="w-full bg-[#090A0F] border border-white/10 focus:border-amber-500 rounded-xl px-4 py-2.5 text-base font-bold text-white font-mono outline-none"
                />
              </div>

              {/* Quick Amount Chips */}
              <div className="flex gap-2">
                {[100, 250, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setGiveCreditData({ ...giveCreditData, amount: amt })}
                    className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono font-semibold"
                  >
                    +{shop.currency_symbol}{amt}
                  </button>
                ))}
              </div>

              {/* Notes / Items Purchased */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Items / Note (Optional)
                </label>
                <input
                  type="text"
                  value={giveCreditData.notes}
                  onChange={(e) => setGiveCreditData({ ...giveCreditData, notes: e.target.value })}
                  placeholder="e.g. 5kg Atta, 2L Mustard Oil"
                  className="w-full bg-[#090A0F] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                />
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Payment Due Date (Optional)
                </label>
                <input
                  type="date"
                  value={giveCreditData.due_date}
                  onChange={(e) => setGiveCreditData({ ...giveCreditData, due_date: e.target.value })}
                  className="w-full bg-[#090A0F] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsGiveCreditOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 rounded-xl shadow-lg shadow-amber-900/40"
                >
                  Confirm Udhaar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
