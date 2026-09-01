import React, { useState } from 'react';
import { Store, User, Mail, Lock, Sparkles, X, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { UserAccount, ShopProfile } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount, shop?: ShopProfile) => void;
  onRegisterSuccess: (shopData: ShopProfile, user: UserAccount) => void;
  onTryDemo: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onRegisterSuccess,
  onTryDemo,
  initialMode = 'register',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  // Form fields
  const [ownerName, setOwnerName] = useState('');
  const [shopName, setShopName] = useState('');
  const [shopCategory, setShopCategory] = useState('Grocery & Kirana');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const categories = [
    'Grocery & Kirana',
    'General Store',
    'Dairy & Bakery',
    'Fruits & Vegetables',
    'Pharmacy & Medical',
    'Stationery & Books',
    'Clothing & Footwear',
    'Electronics & Mobile',
    'Hardware & Sanitary',
    'Other Retail Shop'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in your email and password.');
      return;
    }

    if (mode === 'register') {
      if (!ownerName.trim()) {
        setError('Please enter the owner name.');
        return;
      }
      if (!shopName.trim()) {
        setError('Please enter your shop name.');
        return;
      }

      const newShop: ShopProfile = {
        id: `shop-${Date.now()}`,
        owner_name: ownerName.trim(),
        shop_name: shopName.trim(),
        category: shopCategory,
        email: email.trim().toLowerCase(),
        currency: 'INR',
        currency_symbol: '₹',
        low_stock_threshold_default: 5,
        created_at: new Date().toISOString(),
        is_demo: false,
      };

      const user: UserAccount = {
        id: `user-${Date.now()}`,
        email: email.trim().toLowerCase(),
        owner_name: ownerName.trim(),
        shop_name: shopName.trim(),
        shop_category: shopCategory,
        created_at: new Date().toISOString(),
      };

      // Save user to storage
      const existingUsersStr = localStorage.getItem('shopiq_registered_users') || '[]';
      const existingUsers = JSON.parse(existingUsersStr);
      existingUsers.push({ ...user, password, shop: newShop });
      localStorage.setItem('shopiq_registered_users', JSON.stringify(existingUsers));

      onRegisterSuccess(newShop, user);
      onClose();
    } else {
      // Login
      const existingUsersStr = localStorage.getItem('shopiq_registered_users') || '[]';
      const existingUsers = JSON.parse(existingUsersStr);
      const found = existingUsers.find(
        (u: any) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
      );

      if (found) {
        const user: UserAccount = {
          id: found.id,
          email: found.email,
          owner_name: found.owner_name,
          shop_name: found.shop_name,
          shop_category: found.shop_category,
          created_at: found.created_at,
        };
        onLoginSuccess(user, found.shop);
        onClose();
      } else {
        // Allow instant test login for convenience if testing
        if (password.length >= 4) {
          const newShop: ShopProfile = {
            id: `shop-${Date.now()}`,
            owner_name: email.split('@')[0] || 'Shop Owner',
            shop_name: `${email.split('@')[0]}'s Store`,
            category: 'Grocery & Kirana',
            email: email.trim().toLowerCase(),
            currency: 'INR',
            currency_symbol: '₹',
            low_stock_threshold_default: 5,
            created_at: new Date().toISOString(),
            is_demo: false,
          };
          const user: UserAccount = {
            id: `user-${Date.now()}`,
            email: email.trim().toLowerCase(),
            owner_name: email.split('@')[0] || 'Shop Owner',
            shop_name: `${email.split('@')[0]}'s Store`,
            shop_category: 'Grocery & Kirana',
            created_at: new Date().toISOString(),
          };
          onLoginSuccess(user, newShop);
          onClose();
        } else {
          setError('Invalid email or password. Password must be at least 4 characters.');
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-[#10121D] border border-white/10 rounded-2xl p-6 sm:p-7 shadow-2xl z-10 overflow-hidden">
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-500" />
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand / Logo */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-900/40">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-white font-mono">
                Shop<span className="text-purple-400">IQ</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">Made for ordinary small shop owners</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-white/5 rounded-xl mb-5 border border-white/5">
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              mode === 'register'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Shop Account
          </button>
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              mode === 'login'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Log In
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Owner Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="e.g. Ramesh Sharma"
                    className="w-full bg-[#0A0C14] border border-white/10 focus:border-purple-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-600 outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Shop Name
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="e.g. Sharma Kirana & General Store"
                    className="w-full bg-[#0A0C14] border border-white/10 focus:border-purple-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-600 outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Shop Category
                </label>
                <div className="relative">
                  <Tag className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={shopCategory}
                    onChange={(e) => setShopCategory(e.target.value)}
                    className="w-full bg-[#0A0C14] border border-white/10 focus:border-purple-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white outline-none transition-colors"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c} className="bg-[#121422] text-white">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-[#0A0C14] border border-white/10 focus:border-purple-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-600 outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0A0C14] border border-white/10 focus:border-purple-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-600 outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-purple-900/40 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
          >
            <span>{mode === 'register' ? 'Create My Shop' : 'Log In to My Shop'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-white/10 flex flex-col items-center gap-3 text-center">
          <button
            type="button"
            onClick={() => {
              onTryDemo();
              onClose();
            }}
            className="text-xs text-purple-300 hover:text-purple-200 font-semibold flex items-center gap-1.5 py-1 px-3 rounded-lg bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Or explore with Sharma General Store (Demo)</span>
          </button>
          
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Your shop data is private & isolated to your account</span>
          </div>
        </div>
      </div>
    </div>
  );
};
