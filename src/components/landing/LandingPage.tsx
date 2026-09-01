import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  Bot, 
  ShoppingBag, 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  ArrowRight, 
  Store, 
  CheckCircle2, 
  DollarSign, 
  Package, 
  Database,
  Layers,
  ChevronRight
} from 'lucide-react';
import { ShopProfile } from '../../types';

interface LandingPageProps {
  onStartDemo: () => void;
  onCreateShop: (shopData: Partial<ShopProfile>) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartDemo,
  onCreateShop,
}) => {
  const [formData, setFormData] = useState({
    owner_name: '',
    shop_name: '',
    category: 'Kirana & General Store',
    currency_symbol: '₹',
    phone: '',
  });

  const [isRegistering, setIsRegistering] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.owner_name || !formData.shop_name) return;
    onCreateShop(formData);
  };

  const featureCards = [
    {
      title: 'ShopIQ AI Co-Pilot',
      desc: 'Ask questions in plain language: "What should I restock?", "Who owes me money?", and get grounded answers with exact numbers.',
      icon: Bot,
      color: 'from-purple-600 to-indigo-600',
      badge: 'AI Grounded',
    },
    {
      title: 'Lightning Point of Sale',
      desc: 'Fast touch-friendly register with live unit cost, margin %, receipt generator, and automatic inventory decrementing.',
      icon: ShoppingBag,
      color: 'from-emerald-600 to-teal-600',
      badge: 'Real-time Margin',
    },
    {
      title: 'Credit & Udhaar Ledger',
      desc: 'Track customer trust balances, overdue debts, and generate 1-click WhatsApp payment reminders with UPI QR details.',
      icon: Users,
      color: 'from-amber-600 to-orange-600',
      badge: 'WhatsApp Reminders',
    },
    {
      title: 'Business Health Index',
      desc: 'Daily 0–100 health score evaluated on profit margin, stockout risk, and debtor recovery rates.',
      icon: TrendingUp,
      color: 'from-blue-600 to-cyan-600',
      badge: 'Smart Diagnostics',
    },
  ];

  return (
    <div className="min-h-screen bg-[#07080E] text-slate-100 selection:bg-purple-500/30 selection:text-purple-200">
      {/* Background ambient gradient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
      </div>

      {/* Navigation Header */}
      <header className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800 flex items-center justify-center shadow-lg shadow-purple-600/30">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-extrabold text-2xl tracking-tight text-white font-mono">
              Shop<span className="text-purple-400">IQ</span>
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              AI PRO
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onStartDemo}
            className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl transition-all hover:scale-[1.02]"
          >
            Instant Demo Store
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold">
            <Bot className="w-3.5 h-3.5" />
            <span>AI-Powered Decision Support for Local Shop Owners</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1]">
            Run your shop smarter. <br />
            <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
              Not harder.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Stop guessing daily profits and stockouts. ShopIQ combines real-time inventory, lightning POS, smart credit ledgers, and a dedicated AI assistant grounded in your actual business numbers.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <button
              onClick={onStartDemo}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-base shadow-2xl shadow-purple-900/50 transition-all hover:scale-[1.03] flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>Explore Live Demo Shop</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsRegistering(true)}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-bold text-sm transition-all"
            >
              Create My Store
            </button>
          </div>

          {/* Quick Credibility Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              No Fake Numbers • Grounded AI
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              Supabase PostgreSQL RLS
            </span>
            <span className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-amber-400" />
              Profit & Udhaar Tracking
            </span>
          </div>
        </div>

        {/* Live Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-16">
          {featureCards.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className="p-6 rounded-2xl bg-[#121422]/80 border border-white/10 hover:border-purple-500/40 backdrop-blur-xl transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-white/5 flex items-center text-xs text-purple-400 font-semibold group-hover:translate-x-1 transition-transform">
                  <span>Interactive module</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Custom Shop Registration Modal / Form Overlay */}
        {isRegistering && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsRegistering(false)} />
            <div className="relative w-full max-w-lg bg-[#121422] border border-purple-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl z-10">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Create Your Shop</h3>
                    <p className="text-xs text-slate-400">Set up your store in 30 seconds</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsRegistering(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4 mt-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.owner_name}
                    onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                    placeholder="e.g. Rajesh Kumar"
                    className="w-full bg-[#090A0F] border border-white/10 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Shop / Store Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.shop_name}
                    onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })}
                    placeholder="e.g. Rajesh Super Market"
                    className="w-full bg-[#090A0F] border border-white/10 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Store Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-[#090A0F] border border-white/10 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    >
                      <option value="Kirana & General Store">Kirana & Grocery</option>
                      <option value="Pharmacy & Medical">Pharmacy / Medical</option>
                      <option value="Bakery & Cafe">Bakery & Cafe</option>
                      <option value="Apparel & Clothing">Apparel / Garments</option>
                      <option value="Hardware & Electricals">Hardware & Paints</option>
                      <option value="Stationery & Books">Stationery & Books</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Currency</label>
                    <select
                      value={formData.currency_symbol}
                      onChange={(e) => setFormData({ ...formData, currency_symbol: e.target.value })}
                      className="w-full bg-[#090A0F] border border-white/10 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                    >
                      <option value="₹">₹ - INR (Rupees)</option>
                      <option value="$">$ - USD (Dollar)</option>
                      <option value="€">€ - EUR (Euro)</option>
                      <option value="£">£ - GBP (Pound)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={onStartDemo}
                    className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
                  >
                    Or open demo store instead →
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-900/40"
                  >
                    Launch My Store
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
