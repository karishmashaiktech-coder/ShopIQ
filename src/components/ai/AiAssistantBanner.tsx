import React from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  Bot, 
  ArrowRight, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Package, 
  Users,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { BusinessInsight, ShopProfile } from '../../types';

interface AiAssistantBannerProps {
  shop: ShopProfile;
  insights: BusinessInsight[];
  onOpenAskAi: () => void;
  onSelectInsight?: (insight: BusinessInsight) => void;
  onNavigateTab: (tab: any) => void;
}

export const AiAssistantBanner: React.FC<AiAssistantBannerProps> = ({
  shop,
  insights,
  onOpenAskAi,
  onSelectInsight,
  onNavigateTab,
}) => {
  // Get time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const greeting = getGreeting();

  const getSeverityStyle = (severity: BusinessInsight['severity']) => {
    switch (severity) {
      case 'alert':
        return {
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          card: 'border-rose-500/30 hover:border-rose-500/60 bg-gradient-to-br from-rose-950/20 to-transparent',
          icon: AlertTriangle,
          iconColor: 'text-rose-400',
        };
      case 'warning':
        return {
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          card: 'border-amber-500/30 hover:border-amber-500/60 bg-gradient-to-br from-amber-950/20 to-transparent',
          icon: Clock,
          iconColor: 'text-amber-400',
        };
      case 'success':
        return {
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          card: 'border-emerald-500/30 hover:border-emerald-500/60 bg-gradient-to-br from-emerald-950/20 to-transparent',
          icon: TrendingUp,
          iconColor: 'text-emerald-400',
        };
      default:
        return {
          badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
          card: 'border-purple-500/30 hover:border-purple-500/60 bg-gradient-to-br from-purple-950/20 to-transparent',
          icon: Sparkles,
          iconColor: 'text-purple-400',
        };
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-br from-[#121422] via-[#0E101B] to-[#0A0C14] p-5 sm:p-6 shadow-2xl">
      {/* Decorative ambient background blur */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-8 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header section with Greeting and Ask AI button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-600/30">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-purple-400 font-mono">
                SHOPIQ AI CO-PILOT
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Live Data Grounded
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-0.5">
              {greeting}, {shop.owner_name.split(' ')[0]}. Here&apos;s what needs your attention.
            </h2>
          </div>
        </div>

        <button
          onClick={onOpenAskAi}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-purple-900/40 transition-all hover:scale-[1.02] shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Ask ShopIQ AI</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Dynamic Grounded AI Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5">
        {insights.slice(0, 4).map((item, idx) => {
          const style = getSeverityStyle(item.severity);
          const Icon = style.icon;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.08 }}
              className={`p-4 rounded-xl border backdrop-blur-md flex flex-col justify-between transition-all duration-200 cursor-pointer ${style.card}`}
              onClick={() => {
                if (item.type === 'RESTOCK') onNavigateTab('inventory');
                else if (item.type === 'CREDIT_ALERT') onNavigateTab('credit');
                else if (item.type === 'PROFIT_INSIGHT') onNavigateTab('analytics');
                else onNavigateTab('insights');
              }}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${style.badge}`}>
                    {item.title}
                  </span>
                  <Icon className={`w-4 h-4 ${style.iconColor}`} />
                </div>
                <h3 className="text-sm font-bold text-white leading-snug">
                  {item.headline}
                </h3>
                <p className="text-xs text-slate-300 mt-1.5 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                {item.metric && (
                  <span className="font-mono font-bold text-purple-300">
                    {item.metric}
                  </span>
                )}
                <span className="text-slate-400 hover:text-white flex items-center gap-1 font-medium group">
                  <span>{item.action_text || 'Take action'}</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
