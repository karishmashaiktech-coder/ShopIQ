import React, { useState } from 'react';
import { 
  Package, 
  PlusCircle, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  TrendingUp, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Product, ShopProfile } from '../../types';

interface InventoryViewProps {
  shop: ShopProfile;
  products: Product[];
  onSaveProduct: (p: Partial<Product>) => boolean;
  onDeleteProduct: (id: string) => boolean;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  shop,
  products,
  onSaveProduct,
  onDeleteProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modal State for Add / Edit
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Field State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Groceries',
    cost_price: 40,
    selling_price: 55,
    current_stock: 20,
    min_stock_threshold: 5,
    unit_type: 'packet',
  });

  // Extract unique categories
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesLowStock = !filterLowStockOnly || p.current_stock <= p.min_stock_threshold;
    return matchesSearch && matchesCat && matchesLowStock;
  });

  const lowStockCount = products.filter(p => p.current_stock <= p.min_stock_threshold).length;

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'Groceries',
      cost_price: 40,
      selling_price: 55,
      current_stock: 20,
      min_stock_threshold: 5,
      unit_type: 'packet',
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      category: p.category,
      cost_price: p.cost_price,
      selling_price: p.selling_price,
      current_stock: p.current_stock,
      min_stock_threshold: p.min_stock_threshold,
      unit_type: p.unit_type || 'packet',
    });
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const payload: Partial<Product> = {
      ...(editingProduct ? { id: editingProduct.id } : {}),
      name: formData.name.trim(),
      category: formData.category,
      cost_price: Number(formData.cost_price),
      selling_price: Number(formData.selling_price),
      current_stock: Number(formData.current_stock),
      min_stock_threshold: Number(formData.min_stock_threshold),
      unit_type: formData.unit_type,
    };

    const success = onSaveProduct(payload);
    if (success) {
      setIsFormModalOpen(false);
    }
  };

  // Profit calculation preview in form
  const potentialProfitPerUnit = Number(formData.selling_price) - Number(formData.cost_price);
  const potentialMarginPct = Number(formData.selling_price) > 0 
    ? Math.round((potentialProfitPerUnit / Number(formData.selling_price)) * 100) 
    : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Package className="w-7 h-7 text-purple-400" />
            <span>My Products</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Manage your shop&apos;s products, costs, prices, and stock levels
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-bold shadow-xl shadow-purple-950/40 transition-all hover:scale-[1.02]"
        >
          <PlusCircle className="w-5 h-5" />
          <span>+ Add Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#121422] border border-white/10 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search product by name or category..."
            className="w-full bg-[#090A0F] border border-white/10 focus:border-purple-500 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category & Low Stock Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#090A0F] border border-white/10 text-white rounded-xl px-3 py-2.5 text-xs font-semibold outline-none focus:border-purple-500"
          >
            {categories.map((c) => (
              <option key={c} value={c} className="bg-[#121422]">
                {c === 'All' ? 'All Categories' : c}
              </option>
            ))}
          </select>

          <button
            onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              filterLowStockOnly
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-inner'
                : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Running Low ({lowStockCount})</span>
          </button>

          {/* Toggle Cards / Table */}
          <div className="hidden sm:flex p-1 bg-white/5 rounded-xl border border-white/5">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                viewMode === 'cards' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                viewMode === 'table' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="py-16 p-6 rounded-2xl bg-[#121422] border border-white/10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No products found</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto mt-1">
            {searchTerm || filterLowStockOnly 
              ? 'No products match your current search filter.' 
              : 'Add your first product to get started with your shop.'}
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-5 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-900/30 transition-all inline-flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Product</span>
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* Products Grid (Cards Mode) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((prod) => {
            const isLowStock = prod.current_stock <= prod.min_stock_threshold;
            const profitEach = prod.selling_price - prod.cost_price;

            return (
              <div
                key={prod.id}
                className={`p-5 rounded-2xl bg-[#121422] border transition-all flex flex-col justify-between hover:border-purple-500/40 ${
                  isLowStock ? 'border-rose-500/30 shadow-lg shadow-rose-950/20' : 'border-white/10'
                }`}
              >
                <div>
                  {/* Category & Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-semibold text-slate-400 bg-white/5 px-2 py-0.5 rounded-md truncate max-w-[120px]">
                      {prod.category}
                    </span>
                    {isLowStock ? (
                      <span className="text-[11px] font-bold text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 border border-rose-500/30">
                        <AlertTriangle className="w-3 h-3" />
                        <span>⚠️ Running low</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>✅ In stock</span>
                      </span>
                    )}
                  </div>

                  {/* Product Title */}
                  <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                    {prod.name}
                  </h3>

                  {/* Pricing & Stock Details (Prompt Requirement 7) */}
                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
                      <span className="text-slate-400">Selling price:</span>
                      <span className="font-mono font-bold text-white text-sm">
                        {shop.currency_symbol}{prod.selling_price}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
                      <span className="text-slate-400">Cost:</span>
                      <span className="font-mono font-bold text-slate-300">
                        {shop.currency_symbol}{prod.cost_price}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
                      <span className="text-slate-400">Available:</span>
                      <span className={`font-mono font-bold ${isLowStock ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {prod.current_stock} {prod.unit_type || 'units'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-0.5">
                      <span className="text-slate-400">You earn per unit:</span>
                      <span className="font-mono font-bold text-purple-300">
                        +{shop.currency_symbol}{profitEach}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Edit & Delete Action Buttons */}
                <div className="flex items-center gap-2 mt-5 pt-3 border-t border-white/10">
                  <button
                    onClick={() => handleOpenEdit(prod)}
                    className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-purple-600/20 text-slate-300 hover:text-purple-300 border border-white/10 hover:border-purple-500/30 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete "${prod.name}"?`)) {
                        onDeleteProduct(prod.id);
                      }
                    }}
                    className="py-2 px-3 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 text-xs font-semibold transition-all"
                    title="Delete product"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="p-4 sm:p-5 rounded-2xl bg-[#121422] border border-white/10 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400">
                <th className="py-3 px-3 font-semibold">Product Name</th>
                <th className="py-3 px-3 font-semibold">Category</th>
                <th className="py-3 px-3 font-semibold text-right">Selling Price</th>
                <th className="py-3 px-3 font-semibold text-right">Cost Price</th>
                <th className="py-3 px-3 font-semibold text-right">Available</th>
                <th className="py-3 px-3 font-semibold">Status</th>
                <th className="py-3 px-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProducts.map((prod) => {
                const isLowStock = prod.current_stock <= prod.min_stock_threshold;
                return (
                  <tr key={prod.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-3 font-bold text-white">
                      {prod.name}
                    </td>
                    <td className="py-3.5 px-3 text-slate-400">
                      {prod.category}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-white">
                      {shop.currency_symbol}{prod.selling_price}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-400">
                      {shop.currency_symbol}{prod.cost_price}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-white">
                      {prod.current_stock} {prod.unit_type}
                    </td>
                    <td className="py-3.5 px-3">
                      {isLowStock ? (
                        <span className="text-[10px] font-bold text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/30">
                          ⚠️ Running low
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          ✅ In stock
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(prod)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-purple-600/20 text-slate-300 hover:text-purple-300"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteProduct(prod.id)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Product Modal (Prompt Requirement 8) */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm" 
            onClick={() => setIsFormModalOpen(false)} 
          />
          <div className="relative w-full max-w-lg bg-[#121422] border border-purple-500/30 rounded-2xl p-6 sm:p-7 shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-400" />
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button 
                onClick={() => setIsFormModalOpen(false)} 
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 mt-5">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Product name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Basmati Rice (1kg), Amul Milk (500ml)"
                  className="w-full bg-[#090A0F] border border-white/10 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none"
                />
              </div>

              {/* Category & Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Groceries, Dairy"
                    className="w-full bg-[#090A0F] border border-white/10 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Unit Type
                  </label>
                  <select
                    value={formData.unit_type}
                    onChange={(e) => setFormData({ ...formData, unit_type: e.target.value })}
                    className="w-full bg-[#090A0F] border border-white/10 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  >
                    <option value="packet" className="bg-[#121422]">packet</option>
                    <option value="kg" className="bg-[#121422]">kg</option>
                    <option value="pcs" className="bg-[#121422]">piece (pcs)</option>
                    <option value="liter" className="bg-[#121422]">liter</option>
                    <option value="bottle" className="bg-[#121422]">bottle</option>
                    <option value="box" className="bg-[#121422]">box</option>
                  </select>
                </div>
              </div>

              {/* Friendly Questions (Prompt Section 8) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    How much do you pay for it? ({shop.currency_symbol}) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={formData.cost_price}
                    onChange={(e) => setFormData({ ...formData, cost_price: Number(e.target.value) })}
                    placeholder="Your cost"
                    className="w-full bg-[#090A0F] border border-white/10 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    How much do you sell it for? ({shop.currency_symbol}) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={formData.selling_price}
                    onChange={(e) => setFormData({ ...formData, selling_price: Number(e.target.value) })}
                    placeholder="Selling price"
                    className="w-full bg-[#090A0F] border border-white/10 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white font-mono outline-none"
                  />
                </div>
              </div>

              {/* Live Margin Helper */}
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>You earn on every item:</span>
                </span>
                <span className="font-bold font-mono text-emerald-400">
                  +{shop.currency_symbol}{potentialProfitPerUnit} ({potentialMarginPct}% margin)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    How many do you currently have? *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.current_stock}
                    onChange={(e) => setFormData({ ...formData, current_stock: Number(e.target.value) })}
                    placeholder="Current quantity"
                    className="w-full bg-[#090A0F] border border-white/10 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    When should ShopIQ remind you that it&apos;s running low? *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.min_stock_threshold}
                    onChange={(e) => setFormData({ ...formData, min_stock_threshold: Number(e.target.value) })}
                    placeholder="Reminder limit"
                    className="w-full bg-[#090A0F] border border-white/10 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white font-mono outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-5 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-purple-900/40"
                >
                  {editingProduct ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
