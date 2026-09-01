import React, { useState, useEffect } from 'react';
import { useShopStore } from './services/store';
import { Header } from './components/common/Header';
import { ToastContainer } from './components/common/ToastContainer';
import { DashboardView } from './components/dashboard/DashboardView';
import { InventoryView } from './components/inventory/InventoryView';
import { SalesView } from './components/sales/SalesView';
import { NewSaleModal } from './components/sales/NewSaleModal';
import { CreditLedgerView } from './components/credit/CreditLedgerView';
import { TransactionsView } from './components/transactions/TransactionsView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { AiAssistantView } from './components/ai/AiAssistantView';
import { SettingsView } from './components/settings/SettingsView';
import { AuthModal } from './components/auth/AuthModal';
import { ActiveTab, ShopProfile, UserAccount } from './types';
import { PackagePlus, UserPlus, X, Sparkles } from 'lucide-react';

export function App() {
  const {
    shop,
    products,
    customers,
    transactions,
    metrics,
    insights,
    activeTab,
    setActiveTab,
    theme,
    setTheme,
    toasts,
    dismissToast,
    saveProduct,
    deleteProduct,
    addCustomer,
    recordSale,
    recordPayment,
    recordCreditSale,
    updateShop,
    loadShop,
    resetToDemoData,
    clearEntireDatabase,
  } = useShopStore();

  // User Auth State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const savedUser = localStorage.getItem('shopiq_current_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Global Sale Modal
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);

  // Quick Action Modals from Dashboard
  const [isQuickAddProductOpen, setIsQuickAddProductOpen] = useState(false);
  const [isQuickAddCustomerOpen, setIsQuickAddCustomerOpen] = useState(false);

  // Quick Product Form state
  const [quickProductData, setQuickProductData] = useState({
    name: '',
    category: 'Groceries',
    cost_price: 40,
    selling_price: 55,
    current_stock: 20,
    min_stock_threshold: 5,
    unit_type: 'packet',
  });

  // Quick Customer Form state
  const [quickCustomerData, setQuickCustomerData] = useState({
    name: '',
    phone: '',
    initial_credit: 0,
    due_date: '',
    notes: '',
  });

  // Apply dark class to body
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Auth Handlers
  const handleLoginSuccess = (user: UserAccount, loggedShop?: ShopProfile) => {
    setCurrentUser(user);
    localStorage.setItem('shopiq_current_user', JSON.stringify(user));
    if (loggedShop) {
      loadShop(loggedShop);
    }
  };

  const handleRegisterSuccess = (shopData: ShopProfile, user: UserAccount) => {
    setCurrentUser(user);
    localStorage.setItem('shopiq_current_user', JSON.stringify(user));
    loadShop(shopData);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('shopiq_current_user');
  };

  // Handle Quick Add Product
  const handleQuickAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const success = saveProduct({
      ...quickProductData,
      cost_price: Number(quickProductData.cost_price),
      selling_price: Number(quickProductData.selling_price),
      current_stock: Number(quickProductData.current_stock),
      min_stock_threshold: Number(quickProductData.min_stock_threshold),
    });
    if (success) {
      setIsQuickAddProductOpen(false);
      setQuickProductData({
        name: '',
        category: 'Groceries',
        cost_price: 40,
        selling_price: 55,
        current_stock: 20,
        min_stock_threshold: 5,
        unit_type: 'packet',
      });
    }
  };

  // Handle Quick Add Customer
  const handleQuickAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const success = addCustomer({
      name: quickCustomerData.name.trim(),
      phone: quickCustomerData.phone.trim(),
      current_balance: Number(quickCustomerData.initial_credit || 0),
      total_credit_given: Number(quickCustomerData.initial_credit || 0),
      due_date: quickCustomerData.due_date || undefined,
    });
    if (success) {
      setIsQuickAddCustomerOpen(false);
      setQuickCustomerData({
        name: '',
        phone: '',
        initial_credit: 0,
        due_date: '',
        notes: '',
      });
    }
  };

  // Normalizer for active view tabs
  const isView = (target: ActiveTab) => {
    if (activeTab === target) return true;
    if (target === 'home' && (activeTab === 'dashboard' || activeTab === 'home')) return true;
    if (target === 'products' && (activeTab === 'inventory' || activeTab === 'products')) return true;
    if (target === 'reports' && (activeTab === 'analytics' || activeTab === 'reports')) return true;
    if (target === 'ai' && (activeTab === 'insights' || activeTab === 'ai')) return true;
    if (target === 'sales' && (activeTab === 'transactions' || activeTab === 'sales')) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-[#07080E] text-slate-100 selection:bg-purple-500/30 selection:text-purple-200 flex flex-col font-sans">
      {/* Subtle purple/indigo ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px]" />
      </div>

      {/* Main Friendly Header & Navbar */}
      <Header
        shop={shop}
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        metrics={metrics}
        theme={theme}
        setTheme={setTheme}
        onOpenNewSale={() => setIsNewSaleOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* 1. Home / Dashboard */}
        {isView('home') && (
          <DashboardView
            shop={shop}
            products={products}
            customers={customers}
            transactions={transactions}
            metrics={metrics}
            insights={insights}
            onOpenNewSale={() => setIsNewSaleOpen(true)}
            onOpenAddProduct={() => setIsQuickAddProductOpen(true)}
            onOpenAddCustomer={() => setIsQuickAddCustomerOpen(true)}
            onOpenAskAi={() => setActiveTab('ai')}
            onNavigateTab={setActiveTab}
          />
        )}

        {/* 2. My Products */}
        {isView('products') && (
          <InventoryView
            shop={shop}
            products={products}
            onSaveProduct={saveProduct}
            onDeleteProduct={deleteProduct}
          />
        )}

        {/* 3. New Sale Dedicated Screen */}
        {activeTab === 'new_sale' && (
          <SalesView
            shop={shop}
            products={products}
            customers={customers}
            onRecordSale={recordSale}
          />
        )}

        {/* 4. Credit / Udhaar */}
        {activeTab === 'credit' && (
          <CreditLedgerView
            shop={shop}
            customers={customers}
            onAddCustomer={addCustomer}
            onRecordPayment={recordPayment}
            onRecordCreditSale={recordCreditSale}
          />
        )}

        {/* 5. Sales (Transactions) */}
        {isView('sales') && (
          <TransactionsView
            shop={shop}
            transactions={transactions}
            onOpenNewSale={() => setIsNewSaleOpen(true)}
          />
        )}

        {/* 6. Reports (Analytics) */}
        {isView('reports') && (
          <AnalyticsView
            shop={shop}
            products={products}
            transactions={transactions}
            metrics={metrics}
          />
        )}

        {/* 7. ShopIQ Helper (AI) */}
        {isView('ai') && (
          <AiAssistantView
            shop={shop}
            products={products}
            customers={customers}
            transactions={transactions}
            metrics={metrics}
          />
        )}

        {/* 8. Settings */}
        {activeTab === 'settings' && (
          <SettingsView
            shop={shop}
            currentUser={currentUser}
            onUpdateShop={updateShop}
            onResetDemoData={resetToDemoData}
            onClearAllData={clearEntireDatabase}
            onLogout={handleLogout}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}
      </main>

      {/* Global Quick Sale Modal */}
      <NewSaleModal
        isOpen={isNewSaleOpen}
        onClose={() => setIsNewSaleOpen(false)}
        shop={shop}
        products={products}
        customers={customers}
        onRecordSale={recordSale}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onRegisterSuccess={handleRegisterSuccess}
        onTryDemo={resetToDemoData}
      />

      {/* Quick Add Product Modal */}
      {isQuickAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm" 
            onClick={() => setIsQuickAddProductOpen(false)} 
          />
          <div className="relative w-full max-w-md bg-[#121422] border border-purple-500/30 rounded-2xl p-6 shadow-2xl z-10">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PackagePlus className="w-5 h-5 text-purple-400" />
                Quick Add Product
              </h3>
              <button 
                onClick={() => setIsQuickAddProductOpen(false)} 
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickAddProduct} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={quickProductData.name}
                  onChange={(e) => setQuickProductData({ ...quickProductData, name: e.target.value })}
                  placeholder="e.g. Basmati Rice (1kg)"
                  className="w-full bg-[#090A0F] border border-white/10 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Your Cost ({shop.currency_symbol}) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={quickProductData.cost_price}
                    onChange={(e) => setQuickProductData({ ...quickProductData, cost_price: Number(e.target.value) })}
                    className="w-full bg-[#090A0F] border border-white/10 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Selling Price ({shop.currency_symbol}) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={quickProductData.selling_price}
                    onChange={(e) => setQuickProductData({ ...quickProductData, selling_price: Number(e.target.value) })}
                    className="w-full bg-[#090A0F] border border-white/10 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white font-mono outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Available Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={quickProductData.current_stock}
                    onChange={(e) => setQuickProductData({ ...quickProductData, current_stock: Number(e.target.value) })}
                    className="w-full bg-[#090A0F] border border-white/10 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Alert when below *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quickProductData.min_stock_threshold}
                    onChange={(e) => setQuickProductData({ ...quickProductData, min_stock_threshold: Number(e.target.value) })}
                    className="w-full bg-[#090A0F] border border-white/10 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white font-mono outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsQuickAddProductOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 rounded-xl shadow-lg shadow-purple-900/40"
                >
                  Add to Products
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Add Customer Modal */}
      {isQuickAddCustomerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm" 
            onClick={() => setIsQuickAddCustomerOpen(false)} 
          />
          <div className="relative w-full max-w-md bg-[#121422] border border-amber-500/30 rounded-2xl p-6 shadow-2xl z-10">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-400" />
                Add Udhaar Customer
              </h3>
              <button 
                onClick={() => setIsQuickAddCustomerOpen(false)} 
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickAddCustomer} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={quickCustomerData.name}
                  onChange={(e) => setQuickCustomerData({ ...quickCustomerData, name: e.target.value })}
                  placeholder="e.g. Rahul Verma"
                  className="w-full bg-[#090A0F] border border-white/10 focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Phone / WhatsApp Number
                </label>
                <input
                  type="text"
                  value={quickCustomerData.phone}
                  onChange={(e) => setQuickCustomerData({ ...quickCustomerData, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-[#090A0F] border border-white/10 focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Credit Amount ({shop.currency_symbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={quickCustomerData.initial_credit}
                    onChange={(e) => setQuickCustomerData({ ...quickCustomerData, initial_credit: Number(e.target.value) })}
                    className="w-full bg-[#090A0F] border border-white/10 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={quickCustomerData.due_date}
                    onChange={(e) => setQuickCustomerData({ ...quickCustomerData, due_date: e.target.value })}
                    className="w-full bg-[#090A0F] border border-white/10 rounded-xl px-3.5 py-1.5 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsQuickAddCustomerOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 rounded-xl shadow-lg shadow-amber-900/40"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Toast Alerts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
