import React, { useState } from 'react';
import { 
  Settings, 
  Store, 
  User, 
  DollarSign, 
  Bell, 
  ShieldCheck, 
  RotateCcw, 
  Save, 
  Download, 
  Sparkles, 
  CheckCircle2,
  Trash2,
  LogOut
} from 'lucide-react';
import { ShopProfile, UserAccount } from '../../types';

interface SettingsViewProps {
  shop: ShopProfile;
  currentUser: UserAccount | null;
  onUpdateShop: (data: Partial<ShopProfile>) => boolean;
  onResetDemoData: () => void;
  onClearAllData: () => void;
  onLogout: () => void;
  onOpenAuthModal: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  shop,
  currentUser,
  onUpdateShop,
  onResetDemoData,
  onClearAllData,
  onLogout,
  onOpenAuthModal,
}) => {
  const [formData, setFormData] = useState({
    shop_name: shop.shop_name,
    owner_name: shop.owner_name,
    category: shop.category,
    currency_symbol: shop.currency_symbol || '₹',
    low_stock_threshold_default: shop.low_stock_threshold_default || 5,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onUpdateShop({
      shop_name: formData.shop_name.trim(),
      owner_name: formData.owner_name.trim(),
      category: formData.category,
      currency_symbol: formData.currency_symbol.trim(),
      low_stock_threshold_default: Number(formData.low_stock_threshold_default),
    });

    if (success) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  const handleExportData = () => {
    const data = {
      shop,
      products: localStorage.getItem('shopiq_products'),
      customers: localStorage.getItem('shopiq_customers'),
      transactions: localStorage.getItem('shopiq_transactions'),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shopiq_backup_${shop.shop_name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-purple-400" />
          <span>Settings</span>
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Customize your shop profile, currency, stock alerts, and data storage
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs sm:text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Shop settings updated successfully!</span>
        </div>
      )}

      {/* Account / User Box */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#121422] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">
              {currentUser ? currentUser.owner_name : shop.owner_name}
            </h3>
            <p className="text-xs text-slate-400">
              {currentUser ? currentUser.email : 'Using local guest / demo session'}
            </p>
          </div>
        </div>

        <div>
          {currentUser ? (
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-950/40 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Log In or Create Account</span>
            </button>
          )}
        </div>
      </div>

      {/* Shop Profile Form */}
      <form onSubmit={handleSubmit} className="p-5 sm:p-6 rounded-2xl bg-[#121422] border border-white/10 space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-white/10">
          <Store className="w-5 h-5 text-purple-400" />
          <h3 className="text-base font-bold text-white">Shop Profile Details</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Shop Name *
            </label>
            <input
              type="text"
              required
              value={formData.shop_name}
              onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })}
              className="w-full bg-[#090A0F] border border-white/10 focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Owner Name *
            </label>
            <input
              type="text"
              required
              value={formData.owner_name}
              onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
              className="w-full bg-[#090A0F] border border-white/10 focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Shop Category
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-[#090A0F] border border-white/10 focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Currency Symbol
            </label>
            <input
              type="text"
              value={formData.currency_symbol}
              onChange={(e) => setFormData({ ...formData, currency_symbol: e.target.value })}
              className="w-full bg-[#090A0F] border border-white/10 focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white font-mono outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Default Low Stock Alert
            </label>
            <input
              type="number"
              min="1"
              value={formData.low_stock_threshold_default}
              onChange={(e) => setFormData({ ...formData, low_stock_threshold_default: Number(e.target.value) })}
              className="w-full bg-[#090A0F] border border-white/10 focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white font-mono outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-white/10">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-purple-950/40 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>

      {/* Data Management & Backup */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#121422] border border-white/10 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-white/10">
          <ShieldCheck className="w-5 h-5 text-purple-400" />
          <h3 className="text-base font-bold text-white">Data Management & Backup</h3>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
          <div>
            <h4 className="font-bold text-white text-sm">Download Backup</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Export your inventory, customers, and sales history as a JSON file.
            </p>
          </div>
          <button
            onClick={handleExportData}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/10 transition-all self-start sm:self-auto"
          >
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
          <div>
            <h4 className="font-bold text-white text-sm">Reset to Sample Demo Store</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Populate your shop with Sharma Kirana sample products, customers, and sales.
            </p>
          </div>
          <button
            onClick={() => {
              if (confirm('Reset shop data with sample demo Kirana products and sales?')) {
                onResetDemoData();
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all self-start sm:self-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo Store</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
          <div>
            <h4 className="font-bold text-rose-300 text-sm">Clear All Shop Records</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Permanently wipe all products, sales records, and customer accounts to start totally clean.
            </p>
          </div>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to completely clear all products and sales? This cannot be undone.')) {
                onClearAllData();
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all self-start sm:self-auto"
          >
            <Trash2 className="w-4 h-4" />
            <span>Wipe & Start Fresh</span>
          </button>
        </div>
      </div>
    </div>
  );
};
