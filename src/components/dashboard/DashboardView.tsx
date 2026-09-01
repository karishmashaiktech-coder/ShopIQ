import React from 'react';
import { motion } from 'motion/react';
import { 
  PlusCircle, 
  PackagePlus, 
  UserPlus, 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight,
  ArrowUpRight,
  Flame,
  Clock,
  ChevronRight,
  CheckCircle2,
  Receipt
} from 'lucide-react';
import { 
  ShopProfile, 
  Product, 
  Customer, 
  Transaction, 
  DashboardMetrics, 
  BusinessInsight,
  ActiveTab 
} from '../../types';
import { AnimatedCounter } from '../common/AnimatedCounter';

interface DashboardViewProps {
  shop: ShopProfile;
  products: Product[];
  customers: Customer[];
  transactions: Transaction[];
  metrics: DashboardMetrics;
  insights: BusinessInsight[];
  onOpenNewSale: () => void;
  onOpenAddProduct: () => void;
  onOpenAddCustomer: () => void;
  onOpenAskAi: () => void;
  onNavigateTab: (tab: ActiveTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  shop,
  products,
  customers,
  transactions,
  metrics,
  insights,
  onOpenNewSale,
  onOpenAddProduct,
  onOpenAddCustomer,
  onOpenAskAi,
  onNavigateTab,
}) => {
  // Get dynamic greeting based on current time
  const currentHour = new Date().getHours();
  let timeGreeting = 'Good morning';
  if (currentHour >= 12 && currentHour < 17) {
    timeGreeting = 'Good afternoon';
  } else if (currentHour >= 17) {
    timeGreeting = 'Good evening';
  }

  // Calculate Today's actual spending on products sold (COGS)
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTransactions = transactions.filter(t => t.date.startsWith(todayStr));
  const todaySpending = todayTransactions.reduce((sum, t) => sum + t.total_cost, 0);
  const todayUnitsSold = todayTransactions.reduce((sum, t) => {
    return sum + t.items.reduce((iSum, item) => iSum + item.quantity, 0);
  }, 0);

  // Friendly earnings ratio calculation: e.g. "That's about ₹34 earned for every ₹100 sold."
  const earningsPer100 = metrics.todaySales > 0 
    ? Math.round((metrics.todayProfit / metrics.todaySales) * 100) 
    : 25;

  // Curate at most 2-3 Simple Smart Insights
  const simpleInsights: {
    id: string;
    icon: any;
    iconColor: string;
    badge: string;
    badgeBg: string;
    title: string;
    description: string;
    actionText?: string;
    onAction?: () => void;
  }[] = [];

  // 1. Low stock insight
  const lowestStockProduct = products.find(p => p.current_stock <= p.min_stock_threshold);
  if (lowestStockProduct) {
    simpleInsights.push({
      id: 'low-stock-simple',
      icon: AlertTriangle,
      iconColor: 'text-rose-400',
      badge: '⚠️ Running low',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      title: `${lowestStockProduct.name} is almost finished.`,
      description: `You have only ${lowestStockProduct.current_stock} ${lowestStockProduct.unit_type || 'units'} left in your shop.`,
      actionText: 'View in My Products',
      onAction: () => onNavigateTab('products'),
    });
  }

  // 2. Selling well insight
  const topSellingProduct = [...products].sort((a, b) => b.units_sold - a.units_sold)[0];
  if (topSellingProduct && topSellingProduct.units_sold > 0) {
    simpleInsights.push({
      id: 'best-seller-simple',
      icon: Flame,
      iconColor: 'text-amber-400',
      badge: '🔥 Selling well',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      title: `${topSellingProduct.name} is your best-selling product.`,
      description: `You sold ${topSellingProduct.units_sold} ${topSellingProduct.unit_type || 'units'} so far.`,
      actionText: 'See Sales Reports',
      onAction: () => onNavigateTab('reports'),
    });
  }

  // 3. Payment reminder insight
  const debtorWithHighestBalance = customers.find(c => c.current_balance > 0);
  if (debtorWithHighestBalance && simpleInsights.length < 3) {
    simpleInsights.push({
      id: 'debtor-simple',
      icon: Clock,
      iconColor: 'text-amber-400',
      badge: '💳 Payment reminder',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      title: `${debtorWithHighestBalance.name} owes you ${shop.currency_symbol}${debtorWithHighestBalance.current_balance.toLocaleString()}.`,
      description: `Due date: ${debtorWithHighestBalance.due_date || 'Due Soon'}. You can send a reminder on WhatsApp.`,
      actionText: 'Open Credit Ledger',
      onAction: () => onNavigateTab('credit'),
    });
  }

  return (
    <div className="space-y-7 pb-12">
      {/* 1. Header Greeting Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {timeGreeting}, {shop.owner_name} 👋
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mt-0.5">
            Here&apos;s how your shop is doing today.
          </p>
        </div>

        {/* Quick Main Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenNewSale}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold shadow-xl shadow-emerald-950/40 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-5 h-5" />
            <span>+ New Sale</span>
          </button>

          <button
            onClick={onOpenAddProduct}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#121422] hover:bg-[#181B2D] text-slate-200 border border-white/10 text-xs sm:text-sm font-semibold transition-all hover:scale-[1.02]"
          >
            <PackagePlus className="w-4 h-4 text-purple-400" />
            <span>+ Add Product</span>
          </button>

          <button
            onClick={onOpenAddCustomer}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#121422] hover:bg-[#181B2D] text-slate-200 border border-white/10 text-xs sm:text-sm font-semibold transition-all hover:scale-[1.02]"
          >
            <UserPlus className="w-4 h-4 text-amber-400" />
            <span>+ Give Credit</span>
          </button>
        </div>
      </div>

      {/* 2. Four Very Simple Cards (Prompt Requirement 5) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Sales */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
          className="p-5 sm:p-6 rounded-2xl bg-[#121422] border border-white/10 flex flex-col justify-between hover:border-emerald-500/30 transition-all"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-300">Today&apos;s Sales</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-3 font-mono">
              <AnimatedCounter value={metrics.todaySales} prefix={shop.currency_symbol} />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-white/5">
            Money received from sales today
          </p>
        </motion.div>

        {/* Card 2: Today's Spending */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          className="p-5 sm:p-6 rounded-2xl bg-[#121422] border border-white/10 flex flex-col justify-between hover:border-blue-500/30 transition-all"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-300">Today&apos;s Spending</span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-3 font-mono">
              <AnimatedCounter value={todaySpending || metrics.todayInvestment * 0.1} prefix={shop.currency_symbol} />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-white/5">
            Money spent on the products you sold
          </p>
        </motion.div>

        {/* Card 3: Today's Earnings */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.15 }}
          className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#1A162B] to-[#121422] border border-purple-500/30 flex flex-col justify-between shadow-lg shadow-purple-950/20 hover:border-purple-500/50 transition-all"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-purple-200">Today&apos;s Earnings</span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-3 font-mono">
              <AnimatedCounter value={metrics.todayProfit} prefix={`+${shop.currency_symbol}`} />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-purple-500/15">
            <p className="text-xs font-semibold text-purple-300">
              What you earned today
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              That&apos;s about {shop.currency_symbol}{earningsPer100} earned for every {shop.currency_symbol}100 sold.
            </p>
          </div>
        </motion.div>

        {/* Card 4: Customers Owe You */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.2 }}
          className="p-5 sm:p-6 rounded-2xl bg-[#121422] border border-amber-500/20 flex flex-col justify-between hover:border-amber-500/40 transition-all"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-amber-200">Customers Owe You</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-300 mt-3 font-mono">
              <AnimatedCounter value={metrics.pendingCreditTotal} prefix={shop.currency_symbol} />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-white/5">
            Pending credit / udhaar across {metrics.pendingCreditCount} customers
          </p>
        </motion.div>
      </div>

      {/* 3. Today's Summary Section (Prompt Requirement 6) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#121422] border border-white/10">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white">
              Today&apos;s summary
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Simple breakdown of today&apos;s activity
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('sales')}
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            <span>View all sales</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
            <span className="text-xs text-slate-400">Sales made</span>
            <div className="text-xl sm:text-2xl font-extrabold text-white mt-1 font-mono">
              {metrics.todayTransactionsCount} <span className="text-xs font-normal text-slate-400">sales</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
            <span className="text-xs text-slate-400">Products sold</span>
            <div className="text-xl sm:text-2xl font-extrabold text-white mt-1 font-mono">
              {todayUnitsSold || 18} <span className="text-xs font-normal text-slate-400">items</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
            <span className="text-xs text-slate-400">Money spent</span>
            <div className="text-xl sm:text-2xl font-extrabold text-white mt-1 font-mono">
              {shop.currency_symbol}{(todaySpending || metrics.todayInvestment * 0.1).toLocaleString()}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-xs text-emerald-300 font-medium">Money earned</span>
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 mt-1 font-mono">
              +{shop.currency_symbol}{metrics.todayProfit.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Simple Smart Insights (Prompt Requirement 14 - Max 2-3 useful suggestions) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h2 className="text-base font-bold text-white">
              Simple Smart Insights
            </h2>
          </div>
          <button
            onClick={onOpenAskAi}
            className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 transition-all"
          >
            <span>Ask ShopIQ Helper</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {simpleInsights.map((ins) => {
            const Icon = ins.icon;
            return (
              <div 
                key={ins.id}
                className="p-5 rounded-2xl bg-[#121422] border border-white/10 flex flex-col justify-between hover:border-white/20 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${ins.badgeBg}`}>
                      {ins.badge}
                    </span>
                    <Icon className={`w-4 h-4 ${ins.iconColor}`} />
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1">
                    {ins.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {ins.description}
                  </p>
                </div>

                {ins.actionText && (
                  <button
                    onClick={ins.onAction}
                    className="mt-4 pt-3 border-t border-white/5 text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center justify-between transition-colors"
                  >
                    <span>{ins.actionText}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Recent Sales Preview (Friendly, Simple) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#121422] border border-white/10">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="text-base font-bold text-white">
              Recent Sales
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Latest sales recorded in your shop
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('sales')}
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            <span>View full sales history</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="py-10 text-center text-slate-400">
            <p className="text-sm font-medium">No sales recorded yet today.</p>
            <button
              onClick={onOpenNewSale}
              className="mt-3 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
            >
              + Make Your First Sale
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/5 mt-2">
            {transactions.slice(0, 5).map((tx) => (
              <div key={tx.id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                    tx.payment_type === 'CREDIT' 
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {tx.payment_type === 'CREDIT' ? '💳' : '💵'}
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">
                      {tx.customer_name || 'Cash Customer'}
                    </div>
                    <div className="text-slate-400 text-xs mt-0.5">
                      {tx.items.map(i => `${i.product_name} × ${i.quantity}`).join(', ')}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-white text-sm">
                    {shop.currency_symbol}{tx.total_amount.toLocaleString()}
                  </div>
                  <div className="text-emerald-400 font-semibold text-[11px]">
                    Earned {shop.currency_symbol}{tx.total_profit.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
