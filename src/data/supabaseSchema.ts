export const SUPABASE_SQL_SCHEMA = `-- ==========================================
-- ShopIQ Production PostgreSQL / Supabase Schema
-- Includes Row Level Security (RLS) & Multi-Tenant Isolation
-- ==========================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. SHOPS & PROFILES
CREATE TABLE IF NOT EXISTS public.shops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    shop_name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    category TEXT DEFAULT 'General Store',
    currency TEXT DEFAULT 'INR',
    currency_symbol TEXT DEFAULT '₹',
    low_stock_threshold_default INTEGER DEFAULT 5,
    is_demo BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. PRODUCTS (Inventory)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    selling_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    current_stock NUMERIC(12, 2) NOT NULL DEFAULT 0,
    min_stock_threshold NUMERIC(12, 2) NOT NULL DEFAULT 5,
    units_sold NUMERIC(12, 2) NOT NULL DEFAULT 0,
    unit_type TEXT DEFAULT 'pcs',
    sku TEXT,
    barcode TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. CUSTOMERS (Credit / Udhaar directory)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    total_credit_given NUMERIC(12, 2) DEFAULT 0.00,
    total_credit_paid NUMERIC(12, 2) DEFAULT 0.00,
    current_balance NUMERIC(12, 2) DEFAULT 0.00,
    due_date DATE,
    status TEXT DEFAULT 'CURRENT', -- 'CURRENT', 'DUE_SOON', 'OVERDUE', 'CLEAR'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. SALES (Transactions)
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
    sale_number TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    total_cost NUMERIC(12, 2) NOT NULL,
    total_profit NUMERIC(12, 2) NOT NULL,
    payment_type TEXT NOT NULL CHECK (payment_type IN ('PAID', 'CREDIT')),
    payment_method TEXT NOT NULL DEFAULT 'CASH', -- 'CASH', 'UPI', 'CARD', 'CREDIT'
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name TEXT,
    status TEXT DEFAULT 'COMPLETED',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. SALE ITEMS
CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE NOT NULL,
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT NOT NULL,
    product_name TEXT NOT NULL,
    quantity NUMERIC(12, 2) NOT NULL,
    cost_price NUMERIC(12, 2) NOT NULL,
    selling_price NUMERIC(12, 2) NOT NULL,
    profit NUMERIC(12, 2) NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. CREDIT PAYMENTS
CREATE TABLE IF NOT EXISTS public.credit_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
    customer_name TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    payment_method TEXT DEFAULT 'CASH',
    remaining_balance_after NUMERIC(12, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. BUSINESS INSIGHTS (AI-generated store health cards)
CREATE TABLE IF NOT EXISTS public.business_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    headline TEXT NOT NULL,
    description TEXT NOT NULL,
    metric TEXT,
    action_text TEXT,
    severity TEXT NOT NULL DEFAULT 'info',
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT,
    current_stock NUMERIC(12, 2),
    avg_daily_sales NUMERIC(12, 2),
    estimated_days_left NUMERIC(12, 2),
    recommended_restock_qty NUMERIC(12, 2),
    why TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures each shop owner accesses only their shop data
-- ==========================================

ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_insights ENABLE ROW LEVEL SECURITY;

-- Shops RLS
CREATE POLICY "Users can view and manage their own shops"
ON public.shops FOR ALL
USING (auth.uid() = owner_id);

-- Products RLS
CREATE POLICY "Shop owners can manage their products"
ON public.products FOR ALL
USING (shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid()));

-- Customers RLS
CREATE POLICY "Shop owners can manage their customers"
ON public.customers FOR ALL
USING (shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid()));

-- Sales RLS
CREATE POLICY "Shop owners can manage their sales"
ON public.sales FOR ALL
USING (shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid()));

-- Sale Items RLS
CREATE POLICY "Shop owners can manage their sale items"
ON public.sale_items FOR ALL
USING (shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid()));

-- Credit Payments RLS
CREATE POLICY "Shop owners can manage credit payments"
ON public.credit_payments FOR ALL
USING (shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid()));

-- Business Insights RLS
CREATE POLICY "Shop owners can access their insights"
ON public.business_insights FOR ALL
USING (shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid()));
`;
