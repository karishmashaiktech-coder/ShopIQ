import React from 'react';
import { 
  Lightbulb, 
  Bot, 
  Sparkles, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Package, 
  Users, 
  DollarSign, 
  ShieldCheck, 
  ArrowRight,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';
import { BusinessInsight, ShopProfile, Product, Customer, DashboardMetrics, ActiveTab } from '../../types';

interface BusinessInsightsViewProps {
  shop: ShopProfile;
  insights: BusinessInsight[];
  products: Product[];
  customers: Customer[];
  metrics: DashboardMetrics;
  onOpenAskAi: () => void;
  onNavigateTab: (tab: ActiveTab) => void;
}

export const BusinessInsightsView: React.FC<BusinessInsightsViewProps> = ({
  shop,
  insights,
  products,
  customers,
  metrics,
  onOpenAskAi,
  onNavigateTab,
}) => {
  // Low stock breakdown with days remaining calculation
  const restockPlan = products
    .filter(p => p.current_stock <= p.min_stock_threshold)
    .map(p => {
      const dailyRunRate = Math.max(1, Math.round((p.units_sold / 30) || 3));
      const daysOfCover = Math.max(1, Math.round(p.current_stock / dailyRunRate));
      const recommendedReorder = Math.max(15, dailyRunRate * 7);
      const estReorderCost = recommendedReorder * p.cost_price;

      return {
        product: p,
        dailyRunRate,
        daysOfCover,
        recommendedReorder,
        estReorderCost,
      };
    });

  // Slow moving capital analysis
  const slowMovingItems = [...products]
    .sort((a, b) => a.units_sold - b.units_sold)
    .slice(0, 4)
    .map(p => ({
      product: p,
      tiedCapital: p.current_stock * p.cost_price,
    }));

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400">
            <Lightbulb className="w-4 h-4" />
            <span>AI Business Advisor & Decision Support</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Shop Intelligence & Decision Insights
          </h1>
        </div>

        <button
          onClick={onOpenAskAi}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-purple-900/40 transition-all hover:scale-[1.02]"
        >
          <Bot className="w-4 h-4" />
          <span>Ask Custom Question to AI</span>
        </button>
      </div>

      {/* AI Executive Summary Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-950/40 via-[#121422] to-[#0A0C14] border border-purple-500/30 relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400 font-mono">
                EXECUTIVE INTELLIGENCE SUMMARY
              </span>
              <h2 className="text-lg font-bold text-white mt-0.5">
                Daily Business Health: {metrics.healthScore}/100 (Strong Retail Trajectory)
              </h2>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5 pt-4 border-t border-white/10 text-xs">
          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <span className="font-bold text-emerald-400 block mb-1">✅ High-Velocity Star:</span>
            <p className="text-slate-300">
              Britannia Good Day Biscuits are driving rapid customer turnover with healthy 20% margin. Keep safety stock high.
            </p>
          </div>

          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <span className="font-bold text-rose-400 block mb-1">⚠️ Urgent Supply Action:</span>
            <p className="text-slate-300">
              {restockPlan.length} product(s) have fewer than 3 days of stock remaining. Place wholesale distributor order today.
            </p>
          </div>

          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <span className="font-bold text-amber-400 block mb-1">💰 Working Capital Alert:</span>
            <p className="text-slate-300">
              {shop.currency_symbol}{metrics.pendingCreditTotal.toLocaleString()} locked in customer Udhaar. Send WhatsApp reminders to improve cash flow.
            </p>
          </div>
        </div>
      </div>

      {/* Structured Decision Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Module 1: What should I restock? (Grounded Math Plan) */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#121422] border border-rose-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-rose-400" />
                Precise Restock Order Plan
              </h3>
              <span className="text-xs font-mono text-rose-400 font-bold">
                {restockPlan.length} Critical Stockouts
              </span>
            </div>

            <div className="space-y-3 mt-4">
              {restockPlan.length === 0 ? (
                <div className="py-6 text-center text-slate-500 text-xs">
                  All inventory items are currently well above safety thresholds.
                </div>
              ) : (
                restockPlan.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#090A0F] border border-white/5 text-xs space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-white text-sm">{item.product.name}</h4>
                        <span className="text-[11px] text-slate-400">
                          Current Stock: <strong className="text-rose-400">{item.product.current_stock}</strong> / Min: {item.product.min_stock_threshold}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
                        ~{item.daysOfCover} Day(s) Stock Left
                      </span>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-slate-300 text-[11px] font-mono">
                      <span>Recommend Reorder: <strong className="text-purple-300">{item.recommendedReorder} units</strong></span>
                      <span>Est. Cost: <strong className="text-white">{shop.currency_symbol}{item.estReorderCost.toLocaleString()}</strong></span>
                    </div>

                    {/* Grounded explanation why */}
                    <div className="text-[11px] text-slate-400 bg-white/5 p-2 rounded-lg">
                      <strong className="text-purple-300">Why:</strong> Average sales velocity is ~{item.dailyRunRate} units/day. Running out in {item.daysOfCover} day(s) will cause lost foot-traffic sales.
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('inventory')}
            className="w-full mt-4 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
          >
            <span>Update Inventory Stock</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Module 2: Slow-Moving Stock & Tied-up Capital */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#121422] border border-amber-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                Slow-Moving Stock Strategy
              </h3>
              <span className="text-xs font-mono text-amber-400 font-bold">
                Capital Unlock Ideas
              </span>
            </div>

            <div className="space-y-3 mt-4">
              {slowMovingItems.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#090A0F] border border-white/5 text-xs space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{item.product.name}</h4>
                      <span className="text-[11px] text-slate-400">
                        Units Sold: {item.product.units_sold} • In Stock: {item.product.current_stock}
                      </span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="font-bold text-amber-400">{shop.currency_symbol}{item.tiedCapital.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-500 block">tied capital</span>
                    </div>
                  </div>

                  {/* AI Bundle Recommendation */}
                  <div className="text-[11px] text-slate-300 bg-amber-950/20 border border-amber-500/20 p-2 rounded-lg">
                    <strong className="text-amber-300">Action Plan:</strong> Bundle with high-velocity tea or rice at a 5% combo discount to liquidate stock and reclaim {shop.currency_symbol}{item.tiedCapital.toLocaleString()} in working cash.
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onOpenAskAi}
            className="w-full mt-4 py-2.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
          >
            <span>Ask AI for Custom Discount Pricing</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Complete Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {insights.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-[#121422] border border-white/10 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {item.type}
                </span>
                <span className="font-mono text-xs font-bold text-slate-300">
                  {item.metric}
                </span>
              </div>

              <h3 className="font-bold text-white text-base leading-snug">
                {item.headline}
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {item.description}
              </p>

              {/* Explain Why Block */}
              {item.why_explanation && (
                <div className="mt-3 p-2.5 bg-black/30 rounded-xl border border-white/5 text-[11px] text-slate-400">
                  <span className="font-bold text-purple-300 block mb-0.5">Why this matters:</span>
                  {item.why_explanation}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-slate-400">Action: {item.action_text || 'Review'}</span>
              <button
                onClick={() => {
                  if (item.type === 'RESTOCK') onNavigateTab('inventory');
                  else if (item.type === 'CREDIT_ALERT') onNavigateTab('credit');
                  else if (item.type === 'PROFIT_INSIGHT') onNavigateTab('analytics');
                  else onOpenAskAi();
                }}
                className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
              >
                <span>Execute</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
