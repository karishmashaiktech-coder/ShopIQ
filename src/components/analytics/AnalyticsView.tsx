import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  ShoppingBag, 
  Receipt, 
  Package, 
  Flame, 
  Calendar,
  Sparkles 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { Product, Transaction, ShopProfile, DashboardMetrics } from '../../types';

interface AnalyticsViewProps {
  shop: ShopProfile;
  products: Product[];
  transactions: Transaction[];
  metrics: DashboardMetrics;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  shop,
  products,
  transactions,
  metrics,
}) => {
  const [timeRange, setTimeRange] = useState<'TODAY' | 'WEEK' | 'MONTH' | 'ALL'>('WEEK');

  // Filter transactions based on time range
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);

  const filteredTx = transactions.filter((t) => {
    const txDate = new Date(t.date);
    if (timeRange === 'TODAY') return t.date.startsWith(todayStr);
    if (timeRange === 'WEEK') return txDate >= weekAgo;
    if (timeRange === 'MONTH') return txDate >= monthAgo;
    return true;
  });

  // Calculate Simple Visual Card Metrics
  const totalSales = filteredTx.reduce((sum, t) => sum + t.total_amount, 0);
  const totalSpent = filteredTx.reduce((sum, t) => sum + t.total_cost, 0);
  const totalEarned = filteredTx.reduce((sum, t) => sum + t.total_profit, 0);
  const totalItemsSold = filteredTx.reduce((sum, t) => {
    return sum + t.items.reduce((iSum, i) => iSum + i.quantity, 0);
  }, 0);

  // Calculate Top Selling Products for the selected period
  const productSalesMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
  filteredTx.forEach((t) => {
    t.items.forEach((item) => {
      if (!productSalesMap[item.product_id]) {
        productSalesMap[item.product_id] = {
          name: item.product_name,
          quantity: 0,
          revenue: 0,
        };
      }
      productSalesMap[item.product_id].quantity += item.quantity;
      productSalesMap[item.product_id].revenue += item.total_selling_price;
    });
  });

  const topProductsList = Object.values(productSalesMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Prepare Daily Chart Data
  const dailyDataMap: Record<string, { dateLabel: string; sales: number; profit: number }> = {};
  
  // Initialize last 7 days or days in range
  const daysToShow = timeRange === 'TODAY' ? 1 : timeRange === 'WEEK' ? 7 : 14;
  for (let i = daysToShow - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
    dailyDataMap[key] = { dateLabel: label, sales: 0, profit: 0 };
  }

  filteredTx.forEach((t) => {
    const key = t.date.split('T')[0];
    if (dailyDataMap[key]) {
      dailyDataMap[key].sales += t.total_amount;
      dailyDataMap[key].profit += t.total_profit;
    }
  });

  const chartData = Object.values(dailyDataMap);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-purple-400" />
            <span>Reports</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            See how your shop is performing in simple, clear numbers
          </p>
        </div>

        {/* Time Selection Buttons (Prompt Section 12) */}
        <div className="flex p-1 bg-[#121422] rounded-2xl border border-white/10">
          {(['TODAY', 'WEEK', 'MONTH', 'ALL'] as const).map((tr) => (
            <button
              key={tr}
              onClick={() => setTimeRange(tr)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                timeRange === tr
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tr === 'TODAY' ? 'Today' : tr === 'WEEK' ? 'This week' : tr === 'MONTH' ? 'This month' : 'All time'}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Simple Visual Cards (Prompt Section 12) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 sm:p-6 rounded-2xl bg-[#121422] border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Total Sales</span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-3 font-mono">
              {shop.currency_symbol}{totalSales.toLocaleString()}
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Total money received
          </p>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-[#121422] border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Total Money Spent</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-3 font-mono">
              {shop.currency_symbol}{totalSpent.toLocaleString()}
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Cost of products sold
          </p>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#1A162B] to-[#121422] border border-purple-500/30 flex flex-col justify-between shadow-lg shadow-purple-950/20">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-200">Total Money Earned</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-3 font-mono">
              +{shop.currency_symbol}{totalEarned.toLocaleString()}
            </div>
          </div>
          <p className="text-xs text-purple-300 mt-2">
            Your real profit after costs
          </p>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-[#121422] border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Total Items Sold</span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-3 font-mono">
              {totalItemsSold} <span className="text-xs font-normal text-slate-400">items</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Across {filteredTx.length} sales
          </p>
        </div>
      </div>

      {/* Grid: Left (Daily Sales Chart) & Right (Top Products List) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Simple Daily Sales Chart (Prompt Section 12) */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-2xl bg-[#121422] border border-white/10 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">
              Daily Sales Overview
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Sales made per day in this period
            </p>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis 
                  dataKey="dateLabel" 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${shop.currency_symbol}${val}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0F111E', 
                    borderColor: '#374151', 
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                  }}
                  formatter={(val: any) => [`${shop.currency_symbol}${Number(val).toLocaleString()}`, 'Sales']}
                />
                <Bar 
                  dataKey="sales" 
                  fill="#9333ea" 
                  radius={[6, 6, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products List (Prompt Section 12) */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-[#121422] border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-white/10">
              <Flame className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-base font-bold text-white">
                  Top Selling Products
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Best performing items by quantity
                </p>
              </div>
            </div>

            {topProductsList.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No products sold in this time period yet.
              </div>
            ) : (
              <div className="divide-y divide-white/5 mt-3">
                {topProductsList.map((item, index) => (
                  <div key={index} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-white/5 text-slate-300 font-bold text-xs flex items-center justify-center font-mono">
                        {index + 1}
                      </span>
                      <div>
                        <h4 className="font-bold text-white text-xs sm:text-sm">
                          {item.name}
                        </h4>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {shop.currency_symbol}{item.revenue.toLocaleString()} in sales
                        </span>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <span className="font-bold text-purple-300 text-sm">
                        {item.quantity} sold
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 flex items-center gap-2 mt-4">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <span>Keep your top-selling products well stocked to prevent lost sales.</span>
          </div>
        </div>

      </div>
    </div>
  );
};
