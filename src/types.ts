export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP';

export interface ShopProfile {
  id: string;
  owner_name: string;
  shop_name: string;
  email: string;
  phone?: string;
  address?: string;
  category: string;
  currency: Currency;
  currency_symbol: string;
  low_stock_threshold_default: number;
  created_at: string;
  is_demo?: boolean;
}

export interface Product {
  id: string;
  shop_id: string;
  name: string;
  category: string;
  cost_price: number;
  selling_price: number;
  current_stock: number;
  min_stock_threshold: number;
  units_sold: number;
  unit_type: string; // 'pcs', 'kg', 'packet', 'liter', 'box'
  sku?: string;
  barcode?: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  shop_id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  total_credit_given: number;
  total_credit_paid: number;
  current_balance: number;
  due_date?: string;
  status: 'CURRENT' | 'DUE_SOON' | 'OVERDUE' | 'CLEAR';
  created_at: string;
}

export type PaymentType = 'PAID' | 'CREDIT';
export type PaymentMethod = 'CASH' | 'UPI' | 'CARD' | 'CREDIT' | 'BANK_TRANSFER';
export type TransactionItem = SaleItem;

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  cost_price: number;
  selling_price: number;
  profit: number;
  total_amount: number;
  unit_type?: string;
}

export interface Transaction {
  id: string;
  shop_id: string;
  sale_number: string;
  date: string; // ISO string
  total_amount: number;
  total_cost: number;
  total_profit: number; // Realized profit (0 for active credit sales until full settlement)
  expected_profit?: number; // Expected profit to be recognized when credit is completely paid off
  profit_recognized?: boolean; // Whether credit sale profit has been recognized
  profit_recognized_at?: string; // ISO timestamp when profit was recognized
  payment_type: 'PAID' | 'CREDIT';
  payment_method: 'CASH' | 'UPI' | 'CARD' | 'CREDIT';
  customer_id?: string;
  customer_name?: string;
  status: 'COMPLETED' | 'CANCELLED' | 'RETURNED';
  returned_at?: string;
  returned_by?: string;
  return_reason?: string;
  items: SaleItem[];
  notes?: string;
}

export interface CreditPayment {
  id: string;
  shop_id: string;
  customer_id: string;
  customer_name: string;
  amount: number;
  payment_date: string;
  payment_method: 'CASH' | 'UPI' | 'BANK_TRANSFER';
  notes?: string;
  remaining_balance_after: number;
}

export type InsightType = 
  | 'RESTOCK'
  | 'CREDIT_ALERT'
  | 'PROFIT_INSIGHT'
  | 'BUSINESS_SUGGESTION'
  | 'SLOW_MOVING'
  | 'FAST_MOVING';

export interface BusinessInsight {
  id: string;
  type: InsightType;
  title: string;
  headline: string;
  description: string;
  metric?: string;
  action_text?: string;
  severity: 'info' | 'warning' | 'alert' | 'success';
  product_id?: string;
  product_name?: string;
  current_stock?: number;
  avg_daily_sales?: number;
  estimated_days_left?: number;
  recommended_restock_qty?: number;
  why: string;
  recommendation: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggested_actions?: string[];
  grounded_data?: Record<string, any>;
}

export interface DashboardMetrics {
  todaySales: number;
  todayProfit: number;
  todayInvestment: number;
  todayTransactionsCount: number;
  pendingCreditTotal: number;
  pendingCreditCount: number;
  lowStockCount: number;
  healthScore: number;
  salesGrowthVsYesterday: number;
  profitMarginToday: number;
}

export interface UserAccount {
  id: string;
  email: string;
  owner_name: string;
  shop_name: string;
  shop_category: string;
  created_at: string;
}

export type ActiveTab = 
  | 'home'
  | 'products'
  | 'new_sale'
  | 'credit'
  | 'sales'
  | 'reports'
  | 'ai'
  | 'settings'
  | 'dashboard'
  | 'inventory'
  | 'analytics'
  | 'transactions'
  | 'insights';


