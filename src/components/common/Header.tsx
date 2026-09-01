import React from 'react';
import { 
  Sparkles, 
  Store, 
  Sun, 
  Moon, 
  Home, 
  Package, 
  PlusCircle, 
  CreditCard, 
  Receipt, 
  BarChart3, 
  Bot, 
  Settings, 
  User, 
  LogIn, 
  LogOut 
} from 'lucide-react';
import { ActiveTab, ShopProfile, DashboardMetrics, UserAccount } from '../../types';

interface HeaderProps {
  shop: ShopProfile;
  currentUser: UserAccount | null;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  metrics: DashboardMetrics;
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
  onOpenNewSale: () => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  shop,
  currentUser,
  activeTab,
  setActiveTab,
  metrics,
  theme,
  setTheme,
  onOpenNewSale,
  onOpenAuthModal,
  onLogout,
}) => {
  // Exact Navigation requested in prompt
  const navItems = [
    { 
      id: 'home' as ActiveTab, 
      label: 'Home', 
      icon: Home 
    },
    { 
      id: 'products' as ActiveTab, 
      label: 'My Products', 
      icon: Package,
      badge: metrics.lowStockCount > 0 ? `${metrics.lowStockCount} Low` : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
    },
    { 
      id: 'new_sale' as ActiveTab, 
      label: 'New Sale', 
      icon: PlusCircle,
      isSpecialAction: true
    },
    { 
      id: 'credit' as ActiveTab, 
      label: 'Credit / Udhaar', 
      icon: CreditCard,
      badge: metrics.pendingCreditCount > 0 ? `${metrics.pendingCreditCount}` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
    },
    { 
      id: 'sales' as ActiveTab, 
      label: 'Sales', 
      icon: Receipt 
    },
    { 
      id: 'reports' as ActiveTab, 
      label: 'Reports', 
      icon: BarChart3 
    },
    { 
      id: 'ai' as ActiveTab, 
      label: 'ShopIQ', 
      icon: Bot,
      isAi: true 
    },
    { 
      id: 'settings' as ActiveTab, 
      label: 'Settings', 
      icon: Settings 
    },
  ];

  // Helper to normalize active tab check
  const isItemActive = (id: ActiveTab) => {
    if (activeTab === id) return true;
    if (id === 'home' && activeTab === 'dashboard') return true;
    if (id === 'products' && activeTab === 'inventory') return true;
    if (id === 'reports' && activeTab === 'analytics') return true;
    if (id === 'ai' && activeTab === 'insights') return true;
    if (id === 'sales' && activeTab === 'transactions') return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0A0C14]/95 backdrop-blur-xl transition-colors">
      {/* Top Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Shop Details */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-2.5 group text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800 flex items-center justify-center shadow-lg shadow-purple-600/30 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-white font-mono">
                    Shop<span className="text-purple-400">IQ</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Store className="w-3 h-3 text-slate-500" />
                  <span className="font-medium truncate max-w-[130px] sm:max-w-[200px] text-slate-300">
                    {shop.shop_name}
                  </span>
                  {shop.is_demo ? (
                    <span className="text-[9px] font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30">
                      DEMO DATA
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30">
                      LIVE
                    </span>
                  )}
                </div>
              </div>
            </button>
          </div>

          {/* Quick Header Ticker in Plain Language */}
          <div className="hidden lg:flex items-center gap-4 bg-white/5 border border-white/5 rounded-xl px-4 py-1.5 text-xs">
            <div className="flex items-center gap-1.5 pr-3 border-r border-white/10">
              <span className="text-slate-400">Today&apos;s Sales:</span>
              <span className="font-mono font-bold text-white">
                {shop.currency_symbol}{metrics.todaySales.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-1.5 pr-3 border-r border-white/10">
              <span className="text-slate-400">Earned:</span>
              <span className="font-mono font-bold text-emerald-400">
                +{shop.currency_symbol}{metrics.todayProfit.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Customers Owe:</span>
              <span className="font-mono font-bold text-amber-400">
                {shop.currency_symbol}{metrics.pendingCreditTotal.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Quick Large New Sale Button */}
            <button
              onClick={onOpenNewSale}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-900/30 transition-all hover:scale-[1.02]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ New Sale</span>
            </button>

            {/* User Account / Auth Button */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 pl-1">
                <button
                  onClick={() => setActiveTab('settings')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200"
                  title="Account Settings"
                >
                  <User className="w-3.5 h-3.5 text-purple-400" />
                  <span className="hidden sm:inline truncate max-w-[90px]">{currentUser.owner_name}</span>
                </button>
                <button
                  onClick={onLogout}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-xs font-bold text-purple-300 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In / Register</span>
              </button>
            )}

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl text-slate-400 hover:text-amber-300 hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </div>

      {/* Main Clean Navigation Bar */}
      <div className="border-t border-white/5 bg-[#090A0F]/80 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-1.5 py-1.5 min-w-max">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'new_sale') {
                      onOpenNewSale();
                    } else {
                      setActiveTab(item.id);
                    }
                  }}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-inner'
                      : item.isSpecialAction
                      ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${
                    active 
                      ? 'text-purple-400' 
                      : item.isSpecialAction
                      ? 'text-emerald-400'
                      : 'text-slate-400'
                  }`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${item.badgeColor || 'bg-white/10 text-slate-300'}`}>
                      {item.badge}
                    </span>
                  )}
                  {item.isAi && (
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping ml-0.5" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
