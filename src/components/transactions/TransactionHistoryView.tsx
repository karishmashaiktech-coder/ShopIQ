import React, { useState, useMemo } from 'react';
import { 
  Receipt, 
  Search, 
  Trash2, 
  AlertTriangle, 
  RotateCcw, 
  Filter, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  User, 
  CheckCircle2, 
  ChevronDown,
  X
} from 'lucide-react';
import { Transaction, ShopProfile } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';

interface TransactionHistoryViewProps {
  shop: ShopProfile;
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  onClearTodayTransactions: () => void;
  onClearAllTransactions: () => void;
}

export const TransactionHistoryView: React.FC<TransactionHistoryViewProps> = ({
  shop,
  transactions,
  onDeleteTransaction,
  onClearTodayTransactions,
  onClearAllTransactions,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'PAID' | 'CREDIT'>('ALL');
  const [filterMethod, setFilterMethod] = useState<'ALL' | 'CASH' | 'UPI' | 'CARD' | 'CREDIT'>('ALL');

  // Modals for clear operations
  const [deleteSingleId, setDeleteSingleId] = useState<string | null>(null);
  const [isClearTodayOpen, setIsClearTodayOpen] = useState(false);
  const [isClearAllOpen, setIsClearAllOpen] = useState(false);
  const [selectedTxDetail, setSelectedTxDetail] = useState<Transaction | null>(null);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchSearch = 
        t.sale_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.customer_name && t.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        t.items.some(i => i.product_name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchType = filterType === 'ALL' || t.payment_type === filterType;
      const matchMethod = filterMethod === 'ALL' || t.payment_method === filterMethod;

      return matchSearch && matchType && matchMethod;
    });
  }, [transactions, searchQuery, filterType, filterMethod]);

  const totalFilteredSales = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => sum + t.total_amount, 0);
  }, [filteredTransactions]);

  const totalFilteredProfit = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => sum + t.total_profit, 0);
  }, [filteredTransactions]);

  const totalFilteredCost = totalFilteredSales - totalFilteredProfit;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400">
            <Receipt className="w-4 h-4" />
            <span>Complete Audit & Financial Trail</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Transaction History
          </h1>
        </div>

        {/* Clear Operations CTAs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsClearTodayOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Today&apos;s Bills</span>
          </button>

          <button
            onClick={() => setIsClearAllOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All History</span>
          </button>
        </div>
      </div>

      {/* Metric Summary Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#121422] border border-white/10">
          <span className="text-xs text-slate-400 font-semibold block">Total Invoiced Amount</span>
          <span className="text-xl sm:text-2xl font-black text-white font-mono mt-1 block">
            {shop.currency_symbol}{totalFilteredSales.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Across {filteredTransactions.length} bills
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121422] border border-slate-700/40">
          <span className="text-xs text-slate-400 font-semibold block">Cost of Goods (Investment)</span>
          <span className="text-xl sm:text-2xl font-black text-slate-300 font-mono mt-1 block">
            {shop.currency_symbol}{totalFilteredCost.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Wholesale inventory base
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121422] border border-emerald-500/20">
          <span className="text-xs text-emerald-300 font-semibold block">Realized Net Profit</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-200 font-mono mt-1 block">
            +{shop.currency_symbol}{totalFilteredProfit.toLocaleString()}
          </span>
          <span className="text-[11px] text-emerald-400 mt-1 block">
            {totalFilteredSales > 0 ? ((totalFilteredProfit / totalFilteredSales) * 100).toFixed(1) : 0}% net margin
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121422] border border-purple-500/20">
          <span className="text-xs text-purple-300 font-semibold block">Total Bills Recorded</span>
          <span className="text-xl sm:text-2xl font-black text-purple-200 font-mono mt-1 block">
            {filteredTransactions.length} Sales
          </span>
          <span className="text-[11px] text-purple-400 mt-1 block">
            100% synchronized
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#121422] border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Bill #, Customer name, or item name..."
            className="w-full bg-[#090A0F] border border-white/10 focus:border-purple-500 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Payment Type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="bg-[#090A0F] border border-white/10 text-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-purple-500"
          >
            <option value="ALL">All Payment Types</option>
            <option value="PAID">Paid Immediate</option>
            <option value="CREDIT">Credit (Udhaar)</option>
          </select>

          {/* Payment Method */}
          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value as any)}
            className="bg-[#090A0F] border border-white/10 text-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-purple-500"
          >
            <option value="ALL">All Channels</option>
            <option value="CASH">Cash</option>
            <option value="UPI">UPI</option>
            <option value="CARD">Card</option>
            <option value="CREDIT">Credit</option>
          </select>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="rounded-2xl bg-[#121422] border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-slate-400 font-semibold">
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-3">Date & Time</th>
                <th className="py-3.5 px-3">Customer</th>
                <th className="py-3.5 px-3">Items Sold</th>
                <th className="py-3.5 px-3">Channel / Status</th>
                <th className="py-3.5 px-3 text-right">Cost (Investment)</th>
                <th className="py-3.5 px-3 text-right">Sale Amount</th>
                <th className="py-3.5 px-3 text-right">Profit</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-sm text-slate-300">No transactions found</p>
                    <p className="text-xs text-slate-500 mt-0.5">Use Point of Sale to create new sales entries</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const txCost = tx.total_amount - tx.total_profit;
                  return (
                    <tr key={tx.id} className="hover:bg-white/5 transition-colors group">
                      {/* Invoice Number */}
                      <td className="py-3.5 px-4 font-mono font-bold text-purple-300">
                        {tx.sale_number}
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-3 text-slate-300 font-mono">
                        <div>{new Date(tx.date).toLocaleDateString()}</div>
                        <div className="text-[10px] text-slate-500">{new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-white block">
                          {tx.customer_name || 'Walk-in Customer'}
                        </span>
                        {tx.payment_type === 'CREDIT' && (
                          <span className="text-[10px] text-amber-400 font-semibold font-mono">Udhaar Record</span>
                        )}
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-3">
                        <div className="max-w-[220px] truncate text-slate-300" title={tx.items.map(i => `${i.quantity}x ${i.product_name}`).join(', ')}>
                          {tx.items.map(i => `${i.quantity}x ${i.product_name}`).join(', ')}
                        </div>
                        <span className="text-[10px] text-slate-500">{tx.items.length} product(s)</span>
                      </td>

                      {/* Payment Status & Mode */}
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          tx.payment_type === 'CREDIT'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        }`}>
                          {tx.payment_method}
                        </span>
                      </td>

                      {/* Cost */}
                      <td className="py-3.5 px-3 text-right font-mono font-medium text-slate-400">
                        {shop.currency_symbol}{txCost.toLocaleString()}
                      </td>

                      {/* Total Sale */}
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-white text-sm">
                        {shop.currency_symbol}{tx.total_amount.toLocaleString()}
                      </td>

                      {/* Profit */}
                      <td className="py-3.5 px-3 text-right font-mono font-bold">
                        {tx.payment_type === 'CREDIT' && !tx.profit_recognized ? (
                          <div>
                            <span className="text-amber-400">
                              {shop.currency_symbol}0
                            </span>
                            <div className="text-[10px] text-slate-500 font-sans font-normal">
                              Expected: +{shop.currency_symbol}{(tx.expected_profit ?? (tx.total_amount - txCost)).toLocaleString()}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <span className="text-emerald-400">
                              +{shop.currency_symbol}{tx.total_profit.toLocaleString()}
                            </span>
                            {tx.payment_type === 'CREDIT' && tx.profit_recognized && (
                              <div className="text-[10px] text-emerald-500 font-sans font-normal">
                                Udhaar Cleared
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setDeleteSingleId(tx.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete Transaction"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Single Transaction Modal */}
      <ConfirmModal
        isOpen={!!deleteSingleId}
        title="Delete Transaction Record?"
        message="This specific transaction will be removed from your store history. Note that previously deducted inventory will not be altered."
        confirmLabel="Delete Record"
        isDestructive={true}
        onConfirm={() => {
          if (deleteSingleId) onDeleteTransaction(deleteSingleId);
          setDeleteSingleId(null);
        }}
        onCancel={() => setDeleteSingleId(null)}
      />

      {/* Clear Today's Transactions Modal */}
      <ConfirmModal
        isOpen={isClearTodayOpen}
        title="Clear Today's Transactions?"
        message="All transactions made today will be purged from the active sales journal. This resets today's sales and profit counters to zero."
        confirmLabel="Clear Today's Bills"
        isDestructive={true}
        onConfirm={() => {
          onClearTodayTransactions();
          setIsClearTodayOpen(false);
        }}
        onCancel={() => setIsClearTodayOpen(false)}
      />

      {/* Clear All History Modal (Double Confirmed) */}
      <ConfirmModal
        isOpen={isClearAllOpen}
        title="PERMANENTLY Clear All Sales History?"
        message="DANGER: This will delete the entire transaction ledger across all past dates. Product inventory and customer master profiles will remain untouched."
        confirmLabel="Wipe All History"
        isDestructive={true}
        onConfirm={() => {
          onClearAllTransactions();
          setIsClearAllOpen(false);
        }}
        onCancel={() => setIsClearAllOpen(false)}
      />
    </div>
  );
};
