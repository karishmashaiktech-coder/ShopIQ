import React, { useState } from 'react';
import { 
  Receipt, 
  Search, 
  Filter, 
  Calendar, 
  CreditCard, 
  Banknote, 
  PlusCircle, 
  ChevronRight, 
  CheckCircle2, 
  X,
  FileText
} from 'lucide-react';
import { Transaction, ShopProfile } from '../../types';

interface TransactionsViewProps {
  shop: ShopProfile;
  transactions: Transaction[];
  onOpenNewSale: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  shop,
  transactions,
  onOpenNewSale,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState<'TODAY' | 'WEEK' | 'MONTH' | 'ALL'>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'PAID' | 'CREDIT'>('ALL');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Time boundaries
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);

  const filteredTransactions = transactions.filter((tx) => {
    // Search
    const matchesSearch = 
      (tx.customer_name && tx.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      tx.items.some(i => i.product_name.toLowerCase().includes(searchTerm.toLowerCase()));

    // Payment Filter
    const matchesPayment = paymentFilter === 'ALL' || tx.payment_type === paymentFilter;

    // Time Filter
    const txDate = new Date(tx.date);
    let matchesTime = true;
    if (timeFilter === 'TODAY') {
      matchesTime = tx.date.startsWith(todayStr);
    } else if (timeFilter === 'WEEK') {
      matchesTime = txDate >= weekAgo;
    } else if (timeFilter === 'MONTH') {
      matchesTime = txDate >= monthAgo;
    }

    return matchesSearch && matchesPayment && matchesTime;
  });

  const totalFilteredSales = filteredTransactions.reduce((sum, t) => sum + t.total_amount, 0);
  const totalFilteredProfit = filteredTransactions.reduce((sum, t) => sum + t.total_profit, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Receipt className="w-7 h-7 text-purple-400" />
            <span>Sales</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Complete history of sales, items bought, and money earned
          </p>
        </div>

        <button
          onClick={onOpenNewSale}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white text-sm font-bold shadow-xl shadow-emerald-950/40 transition-all hover:scale-[1.02]"
        >
          <PlusCircle className="w-5 h-5" />
          <span>+ New Sale</span>
        </button>
      </div>

      {/* Quick Summary Ticker */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#121422] border border-white/10">
          <span className="text-xs text-slate-400">Total Sales in View</span>
          <div className="text-xl sm:text-2xl font-black text-white font-mono mt-1">
            {shop.currency_symbol}{totalFilteredSales.toLocaleString()}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121422] border border-white/10">
          <span className="text-xs text-slate-400">Total Money Earned</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-1">
            +{shop.currency_symbol}{totalFilteredProfit.toLocaleString()}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121422] border border-white/10">
          <span className="text-xs text-slate-400">Sales Count</span>
          <div className="text-xl sm:text-2xl font-black text-white font-mono mt-1">
            {filteredTransactions.length} <span className="text-xs font-normal text-slate-400">receipts</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#121422] border border-white/10 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name or product bought..."
            className="w-full bg-[#090A0F] border border-white/10 focus:border-purple-500 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none"
          />
        </div>

        {/* Time and Payment Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Time Filter */}
          <div className="flex p-1 bg-[#090A0F] rounded-xl border border-white/10">
            {(['TODAY', 'WEEK', 'MONTH', 'ALL'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeFilter(tf)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  timeFilter === tf
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf === 'TODAY' ? 'Today' : tf === 'WEEK' ? 'This Week' : tf === 'MONTH' ? 'This Month' : 'All Time'}
              </button>
            ))}
          </div>

          {/* Payment Type */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as any)}
            className="bg-[#090A0F] border border-white/10 text-white rounded-xl px-3 py-2 text-xs font-semibold outline-none"
          >
            <option value="ALL" className="bg-[#121422]">All Payments</option>
            <option value="PAID" className="bg-[#121422]">💵 Paid Now</option>
            <option value="CREDIT" className="bg-[#121422]">💳 Credit / Udhaar</option>
          </select>
        </div>
      </div>

      {/* Sales Receipts List (Prompt Section 11) */}
      {filteredTransactions.length === 0 ? (
        <div className="py-16 p-6 rounded-2xl bg-[#121422] border border-white/10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto mb-4">
            <Receipt className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No sales found</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto mt-1">
            No sales match the selected filters or search query.
          </p>
          <button
            onClick={onOpenNewSale}
            className="mt-5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all inline-flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Make a Sale</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((tx) => {
            const isCredit = tx.payment_type === 'CREDIT';
            const formattedDate = new Date(tx.date).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            });

            return (
              <div
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className="p-4 sm:p-5 rounded-2xl bg-[#121422] border border-white/10 hover:border-purple-500/30 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left details */}
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${
                    isCredit
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {isCredit ? '💳' : '💵'}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm">
                        {tx.customer_name || 'Cash Customer'}
                      </h4>
                      {isCredit ? (
                        <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.2 rounded-full">
                          Credit / Udhaar
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.2 rounded-full">
                          Paid ({tx.payment_method})
                        </span>
                      )}
                    </div>

                    {/* Products summary */}
                    <div className="text-xs text-slate-400 mt-1">
                      {tx.items.map(i => `${i.product_name} × ${i.quantity}`).join(', ')}
                    </div>

                    <div className="text-[11px] text-slate-500 mt-1">
                      {formattedDate}
                    </div>
                  </div>
                </div>

                {/* Right amounts */}
                <div className="flex items-center justify-between sm:justify-end gap-5 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5 font-mono">
                  <div className="text-left sm:text-right">
                    <span className="text-[11px] text-slate-400 block font-sans">Sale Total:</span>
                    <span className="text-base sm:text-lg font-black text-white">
                      {shop.currency_symbol}{tx.total_amount.toLocaleString()}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block font-sans">You Earned:</span>
                    <span className="text-base sm:text-lg font-black text-emerald-400">
                      +{shop.currency_symbol}{tx.total_profit.toLocaleString()}
                    </span>
                  </div>

                  <ChevronRight className="w-5 h-5 text-slate-500 hidden sm:block" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sale Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm" 
            onClick={() => setSelectedTx(null)} 
          />
          <div className="relative w-full max-w-md bg-[#121422] border border-purple-500/30 rounded-2xl p-6 shadow-2xl z-10 font-mono">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2 font-sans">
                <Receipt className="w-5 h-5 text-purple-400" />
                Sale Receipt
              </h3>
              <button 
                onClick={() => setSelectedTx(null)} 
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400 font-sans">Customer:</span>
                <span className="font-bold text-white font-sans">{selectedTx.customer_name || 'Cash Customer'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400 font-sans">Date & Time:</span>
                <span className="text-slate-200">{new Date(selectedTx.date).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400 font-sans">Payment Status:</span>
                <span className={selectedTx.payment_type === 'CREDIT' ? 'text-amber-300 font-bold' : 'text-emerald-400 font-bold'}>
                  {selectedTx.payment_type === 'CREDIT' ? 'Credit / Udhaar' : `Paid via ${selectedTx.payment_method}`}
                </span>
              </div>

              {/* Items List */}
              <div className="pt-2">
                <span className="text-xs font-bold text-slate-300 font-sans block mb-2">Items Sold:</span>
                <div className="space-y-1.5 bg-white/5 p-3 rounded-xl">
                  {selectedTx.items.map((i, idx) => (
                    <div key={idx} className="flex justify-between text-slate-300">
                      <span>{i.product_name} × {i.quantity}</span>
                      <span>{shop.currency_symbol}{i.total_selling_price}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between py-2 border-t border-white/10 text-sm font-bold">
                <span className="font-sans text-slate-200">Total Sale:</span>
                <span className="text-white">{shop.currency_symbol}{selectedTx.total_amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 text-emerald-400 font-bold text-sm">
                <span className="font-sans">Money Earned:</span>
                <span>+{shop.currency_symbol}{selectedTx.total_profit.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setSelectedTx(null)}
                className="px-5 py-2 text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 rounded-xl font-sans"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
