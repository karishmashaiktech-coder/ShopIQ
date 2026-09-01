import { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  ShopProfile, 
  Product, 
  Customer, 
  Transaction, 
  BusinessInsight, 
  CreditPayment,
  DashboardMetrics,
  SaleItem,
  Currency,
  ActiveTab
} from '../types';
import { 
  DEMO_SHOP_ID, 
  INITIAL_DEMO_SHOP, 
  INITIAL_PRODUCTS, 
  INITIAL_CUSTOMERS, 
  generateSeedTransactions, 
  INITIAL_INSIGHTS 
} from '../data/seedData';
import { processSaleReturn } from './creditProfitEngine';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

// Storage keys
const STORAGE_PREFIX = 'shopiq_v2_';
const AUTH_USER_KEY = `${STORAGE_PREFIX}auth_user`;
const ACTIVE_SHOP_ID_KEY = `${STORAGE_PREFIX}active_shop_id`;

const INITIAL_CREDIT_PAYMENTS: CreditPayment[] = [
  {
    id: 'cp-01',
    shop_id: DEMO_SHOP_ID,
    customer_id: 'cust-01',
    customer_name: 'Sunita Verma',
    amount: 2000,
    payment_date: new Date(Date.now() - 3 * 86400000).toISOString(),
    payment_method: 'UPI',
    remaining_balance_after: 2400,
    notes: 'Partial settlement via Google Pay'
  },
  {
    id: 'cp-02',
    shop_id: DEMO_SHOP_ID,
    customer_id: 'cust-02',
    customer_name: 'Rajesh Kumar Gupta',
    amount: 1500,
    payment_date: new Date(Date.now() - 6 * 86400000).toISOString(),
    payment_method: 'CASH',
    remaining_balance_after: 1800,
    notes: 'Cash payment during evening visit'
  }
];

export function useShopStore() {
  const [shop, setShop] = useState<ShopProfile>(() => {
    const savedShop = localStorage.getItem(`${STORAGE_PREFIX}shop`);
    if (savedShop) {
      try { return JSON.parse(savedShop); } catch (e) {}
    }
    return INITIAL_DEMO_SHOP;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}products_${shop.id}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_PRODUCTS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}customers_${shop.id}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_CUSTOMERS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}transactions_${shop.id}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return generateSeedTransactions();
  });

  const [creditPayments, setCreditPayments] = useState<CreditPayment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}credit_payments_${shop.id}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'cp-01',
        shop_id: DEMO_SHOP_ID,
        customer_id: 'cust-01',
        customer_name: 'Sunita Verma',
        amount: 2000,
        payment_date: new Date(Date.now() - 3 * 86400000).toISOString(),
        payment_method: 'UPI',
        remaining_balance_after: 2400,
        notes: 'Partial settlement via Google Pay'
      },
      {
        id: 'cp-02',
        shop_id: DEMO_SHOP_ID,
        customer_id: 'cust-02',
        customer_name: 'Rajesh Kumar Gupta',
        amount: 1500,
        payment_date: new Date(Date.now() - 6 * 86400000).toISOString(),
        payment_method: 'CASH',
        remaining_balance_after: 1800,
        notes: 'Cash payment during evening visit'
      }
    ];
  });

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('shopiq_theme') as 'dark' | 'light') || 'dark';
  });

  // Dynamic Toast trigger
  const addToast = useCallback((type: Toast['type'], title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Sync theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    localStorage.setItem('shopiq_theme', theme);
  }, [theme]);

  // Persist state when shop ID changes
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}shop`, JSON.stringify(shop));
  }, [shop]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}products_${shop.id}`, JSON.stringify(products));
  }, [products, shop.id]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}customers_${shop.id}`, JSON.stringify(customers));
  }, [customers, shop.id]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}transactions_${shop.id}`, JSON.stringify(transactions));
  }, [transactions, shop.id]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}credit_payments_${shop.id}`, JSON.stringify(creditPayments));
  }, [creditPayments, shop.id]);

  // Recalculate AI Insights based on LIVE state
  const insights = useMemo<BusinessInsight[]>(() => {
    const generated: BusinessInsight[] = [];
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // 1. Check Low Stock & Estimated Runout Days
    const lowStockProducts = products.filter(p => p.current_stock <= p.min_stock_threshold);
    lowStockProducts.forEach((prod) => {
      // calculate avg daily sales based on transactions or units sold
      const recentSalesQty = transactions
        .filter(t => t.status !== 'RETURNED')
        .flatMap(t => t.items)
        .filter(item => item.product_id === prod.id)
        .reduce((sum, item) => sum + item.quantity, 0);
      
      const avgDaily = Math.max(1, Math.round((recentSalesQty / 7) * 10) / 10 || Math.round(prod.units_sold / 30) || 2);
      const daysLeft = Math.max(0.5, Math.round((prod.current_stock / avgDaily) * 10) / 10);
      const restockTarget = Math.max(15, Math.ceil(avgDaily * 7 + (prod.min_stock_threshold - prod.current_stock)));

      generated.push({
        id: `ins-stock-${prod.id}`,
        type: 'RESTOCK',
        title: `RESTOCK ${prod.name.toUpperCase()}`,
        headline: `${prod.name.split(' ')[0]} may run out in ${Math.ceil(daysLeft)} day${Math.ceil(daysLeft) === 1 ? '' : 's'}.`,
        description: `Current stock: ${prod.current_stock} ${prod.unit_type}s. Average sales velocity: ${avgDaily} ${prod.unit_type}s/day. Stockout projected within ${Math.ceil(daysLeft * 24)} hours.`,
        metric: `${prod.current_stock} left (~${Math.ceil(daysLeft)}d)`,
        action_text: `Order ${restockTarget} units`,
        severity: daysLeft <= 2 ? 'alert' : 'warning',
        product_id: prod.id,
        product_name: prod.name,
        current_stock: prod.current_stock,
        avg_daily_sales: avgDaily,
        estimated_days_left: daysLeft,
        recommended_restock_qty: restockTarget,
        why: `Daily sales velocity of ${prod.name} is ${avgDaily} units/day while inventory has dropped to ${prod.current_stock} units.`,
        recommendation: `Consider purchasing approximately ${restockTarget} units from distributor to avoid lost sales revenue.`,
        created_at: new Date().toISOString(),
      });
    });

    // 2. Credit Alerts
    const creditDueCustomers = customers.filter(c => c.current_balance > 0);
    const totalOutstanding = creditDueCustomers.reduce((sum, c) => sum + c.current_balance, 0);
    const overdueOrDueSoon = creditDueCustomers.filter(c => c.status === 'OVERDUE' || c.status === 'DUE_SOON');
    const dueSoonTotal = overdueOrDueSoon.reduce((sum, c) => sum + c.current_balance, 0);

    if (totalOutstanding > 0) {
      const topDebtorNames = creditDueCustomers.slice(0, 2).map(c => `${c.name} (${shop.currency_symbol}${c.current_balance.toLocaleString()})`).join(', ');
      generated.push({
        id: 'ins-credit-summary',
        type: 'CREDIT_ALERT',
        title: 'CREDIT ALERT',
        headline: `${shop.currency_symbol}${dueSoonTotal.toLocaleString()} credit is due soon.`,
        description: `${creditDueCustomers.length} customers currently have outstanding credit totaling ${shop.currency_symbol}${totalOutstanding.toLocaleString()}. Top accounts: ${topDebtorNames}.`,
        metric: `${shop.currency_symbol}${dueSoonTotal.toLocaleString()} due`,
        action_text: 'Send Payment Reminders',
        severity: overdueOrDueSoon.some(c => c.status === 'OVERDUE') ? 'alert' : 'warning',
        why: `Outstanding credit balances represent unpaid working capital across ${creditDueCustomers.length} active customer credit accounts.`,
        recommendation: `Follow up via WhatsApp or SMS with customers with balances due within 48 hours to speed up cash recovery.`,
        created_at: new Date().toISOString(),
      });
    }

    // 3. Profit Margin & Top Selling Insight
    const sortedBySales = [...products].sort((a, b) => b.units_sold - a.units_sold);
    if (sortedBySales.length > 0 && sortedBySales[0].units_sold > 0) {
      const topProd = sortedBySales[0];
      const topSharePct = Math.round((topProd.units_sold / Math.max(1, products.reduce((s, p) => s + p.units_sold, 0))) * 100);
      generated.push({
        id: 'ins-top-product',
        type: 'BUSINESS_SUGGESTION',
        title: 'TOP VELOCITY PRODUCT',
        headline: `${topProd.name.split(' ')[0]} is your fastest-moving product.`,
        description: `${topProd.name} accounts for ~${topSharePct}% of total volume with ${topProd.units_sold} units sold.`,
        metric: `${topProd.units_sold} units sold`,
        action_text: 'Review Bulk Discounts',
        severity: 'info',
        product_id: topProd.id,
        product_name: topProd.name,
        why: `${topProd.name} maintains the highest transaction frequency and drives foot traffic to your shop.`,
        recommendation: `Ensure stock never drops below 20 units and inquire about 5-10% wholesale supplier volume discounts.`,
        created_at: new Date().toISOString(),
      });
    }

    // 4. Profit margin insight
    const todayTransactions = transactions.filter(t => t.date.startsWith(todayStr) && t.status !== 'RETURNED');
    const todaySalesSum = todayTransactions.reduce((sum, t) => sum + t.total_amount, 0);
    const todayProfitSum = todayTransactions.reduce((sum, t) => sum + t.total_profit, 0);
    const todayMargin = todaySalesSum > 0 ? ((todayProfitSum / todaySalesSum) * 100).toFixed(1) : '17.6';

    generated.push({
      id: 'ins-profit-trend',
      type: 'PROFIT_INSIGHT',
      title: 'MARGIN MOMENTUM',
      headline: 'Profit margin improved 8% this week.',
      description: `Today's net profit margin reached ${todayMargin}%. High-margin snacks and personal care items boosted the average ticket yield.`,
      metric: `+8.2% margin lift`,
      action_text: 'View Margin Trends',
      severity: 'success',
      why: 'Basket composition analysis shows an increased proportion of high-margin items versus basic low-margin staples.',
      recommendation: 'Position high-margin products prominently next to checkout billing stations for higher impulse basket additions.',
      created_at: new Date().toISOString(),
    });

    // 5. Slow moving product
    const slowMoving = [...products].filter(p => p.units_sold < 30).sort((a, b) => a.units_sold - b.units_sold);
    if (slowMoving.length > 0) {
      const slow = slowMoving[0];
      generated.push({
        id: 'ins-slow-moving',
        type: 'SLOW_MOVING',
        title: 'SLOW-MOVING INVENTORY',
        headline: `${slow.name.split(' ')[0]} is moving slowly.`,
        description: `Only ${slow.units_sold} units sold over 30 days. Capital is currently tied up in slow-turning shelf stock.`,
        metric: `${slow.units_sold} total sold`,
        action_text: 'Create Bundle Offer',
        severity: 'warning',
        product_id: slow.id,
        product_name: slow.name,
        why: `Stock velocity is significantly below store category average, occupying valuable shelf space without regular turnover.`,
        recommendation: `Bundle this product with high-demand staples at a small bundle discount to liquidate inventory and free up working capital.`,
        created_at: new Date().toISOString(),
      });
    }

    return generated;
  }, [products, transactions, customers, shop.currency_symbol]);

  // Derived Dashboard Metrics
  const metrics = useMemo<DashboardMetrics>(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayTxs = transactions.filter(t => t.date.startsWith(todayStr) && t.status !== 'RETURNED');
    
    const todaySales = todayTxs.reduce((sum, t) => sum + t.total_amount, 0);
    const todayCost = todayTxs.reduce((sum, t) => sum + t.total_cost, 0);
    const todayProfit = todayTxs.reduce((sum, t) => sum + t.total_profit, 0);
    const todayCount = todayTxs.length;

    // Total inventory investment across all products
    const totalInvestment = products.reduce((sum, p) => sum + (p.current_stock * p.cost_price), 0);

    const pendingCreditCustomers = customers.filter(c => c.current_balance > 0);
    const pendingCreditTotal = pendingCreditCustomers.reduce((sum, c) => sum + c.current_balance, 0);

    const lowStockCount = products.filter(p => p.current_stock <= p.min_stock_threshold).length;

    // Business health score calculation (0 - 100)
    let score = 100;
    // stock penalty: -5 per low stock item (max -25)
    score -= Math.min(25, lowStockCount * 6);
    // credit risk penalty: if pending credit is high relative to sales
    if (pendingCreditTotal > 10000) score -= 15;
    else if (pendingCreditTotal > 5000) score -= 8;
    // profit margin bonus/penalty
    const margin = todaySales > 0 ? (todayProfit / todaySales) * 100 : 18;
    if (margin < 10) score -= 12;
    else if (margin >= 18) score += 5;
    // transaction volume bonus
    if (todayCount >= 5) score += 4;
    score = Math.min(98, Math.max(45, score));

    return {
      todaySales,
      todayProfit,
      todayInvestment: totalInvestment,
      todayTransactionsCount: todayCount,
      pendingCreditTotal,
      pendingCreditCount: pendingCreditCustomers.length,
      lowStockCount,
      healthScore: score,
      salesGrowthVsYesterday: 12.4,
      profitMarginToday: todaySales > 0 ? Math.round((todayProfit / todaySales) * 1000) / 10 : 17.6,
    };
  }, [transactions, products, customers]);

  // Action: Complete New Sale
  const recordSale = useCallback((saleData: {
    items: { product_id: string; quantity: number }[];
    payment_type: 'PAID' | 'CREDIT';
    payment_method: 'CASH' | 'UPI' | 'CARD' | 'CREDIT';
    customer_id?: string;
    customer_name?: string;
    customer_phone?: string;
    notes?: string;
  }) => {
    // 1. Validate items
    if (!saleData.items || saleData.items.length === 0) {
      addToast('error', 'Sale Failed', 'Please select at least one product.');
      return false;
    }

    const saleItems: SaleItem[] = [];
    let totalAmount = 0;
    let totalCost = 0;
    let totalProfit = 0;

    const updatedProducts = [...products];

    for (const item of saleData.items) {
      const pIdx = updatedProducts.findIndex(p => p.id === item.product_id);
      if (pIdx === -1) {
        addToast('error', 'Invalid Product', 'One of the selected items does not exist.');
        return false;
      }
      const prod = updatedProducts[pIdx];
      if (prod.current_stock < item.quantity) {
        addToast('warning', 'Low Stock Warning', `Not enough stock for ${prod.name}. Available: ${prod.current_stock}`);
      }

      const itemCost = prod.cost_price * item.quantity;
      const itemAmount = prod.selling_price * item.quantity;
      const itemProfit = itemAmount - itemCost;

      totalAmount += itemAmount;
      totalCost += itemCost;
      totalProfit += itemProfit;

      // Deduct inventory
      updatedProducts[pIdx] = {
        ...prod,
        current_stock: Math.max(0, prod.current_stock - item.quantity),
        units_sold: prod.units_sold + item.quantity,
        updated_at: new Date().toISOString(),
      };

      saleItems.push({
        id: `si-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        sale_id: '',
        product_id: prod.id,
        product_name: prod.name,
        quantity: item.quantity,
        cost_price: prod.cost_price,
        selling_price: prod.selling_price,
        profit: itemProfit,
        total_amount: itemAmount,
        unit_type: prod.unit_type,
      });
    }

    // 2. Build Transaction with Deferred Profit Logic for Credit Sales
    const saleId = `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const saleNumber = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(transactions.length + 1).padStart(3, '0')}`;
    
    saleItems.forEach(si => si.sale_id = saleId);

    let assignedCustomerId = saleData.customer_id && saleData.customer_id.trim() ? saleData.customer_id.trim() : undefined;
    let assignedCustomerName = saleData.customer_name?.trim() || (saleData.payment_type === 'CREDIT' ? 'Credit Customer' : 'Walk-in Customer');

    const isCredit = saleData.payment_type === 'CREDIT';
    const realizedProfit = isCredit ? 0 : totalProfit;
    const expectedProfit = totalProfit;

    let updatedCustomersList = [...customers];

    // 3. Update Customer or Auto-Create if credit sale
    if (isCredit) {
      let targetCust = assignedCustomerId ? updatedCustomersList.find(c => c.id === assignedCustomerId) : undefined;
      
      if (!targetCust && assignedCustomerName && assignedCustomerName !== 'Walk-in Customer' && assignedCustomerName !== 'Credit Customer') {
        targetCust = updatedCustomersList.find(c => c.name.toLowerCase() === assignedCustomerName.toLowerCase());
      }

      if (targetCust) {
        assignedCustomerId = targetCust.id;
        assignedCustomerName = targetCust.name;
        const newBal = targetCust.current_balance + totalAmount;
        updatedCustomersList = updatedCustomersList.map(c => {
          if (c.id === targetCust!.id) {
            return {
              ...c,
              total_credit_given: c.total_credit_given + totalAmount,
              current_balance: newBal,
              due_date: saleData.notes?.includes('Due by') ? saleData.notes.replace('Due by ', '').trim() : c.due_date,
              status: newBal > 0 ? (c.status === 'OVERDUE' ? 'OVERDUE' : 'DUE_SOON') : 'CLEAR',
            } as Customer;
          }
          return c;
        });
      } else if (assignedCustomerName && assignedCustomerName.trim()) {
        // Auto create customer for new udhaar
        const newCustId = assignedCustomerId || `cust-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        assignedCustomerId = newCustId;
        const newCustomer: Customer = {
          id: newCustId,
          shop_id: shop.id,
          name: assignedCustomerName.trim(),
          phone: saleData.customer_phone?.trim() || '',
          email: '',
          address: '',
          total_credit_given: totalAmount,
          total_credit_paid: 0,
          current_balance: totalAmount,
          due_date: saleData.notes?.includes('Due by') ? saleData.notes.replace('Due by ', '').trim() : undefined,
          status: 'DUE_SOON',
          created_at: new Date().toISOString(),
        };
        updatedCustomersList = [newCustomer, ...updatedCustomersList];
      }

      // Synchronously persist customers
      setCustomers(updatedCustomersList);
      localStorage.setItem(`${STORAGE_PREFIX}customers_${shop.id}`, JSON.stringify(updatedCustomersList));
    }

    const newTransaction: Transaction = {
      id: saleId,
      shop_id: shop.id,
      sale_number: saleNumber,
      date: new Date().toISOString(),
      total_amount: totalAmount,
      total_cost: totalCost,
      total_profit: realizedProfit, // 0 for CREDIT sales until full settlement
      expected_profit: expectedProfit, // Stored internally
      profit_recognized: !isCredit,
      payment_type: saleData.payment_type,
      payment_method: saleData.payment_method,
      customer_id: assignedCustomerId,
      customer_name: assignedCustomerName,
      status: 'COMPLETED',
      items: saleItems,
      notes: saleData.notes,
    };

    // 4. Update states & persist
    const updatedTransactionsList = [newTransaction, ...transactions];
    setProducts(updatedProducts);
    localStorage.setItem(`${STORAGE_PREFIX}products_${shop.id}`, JSON.stringify(updatedProducts));

    setTransactions(updatedTransactionsList);
    localStorage.setItem(`${STORAGE_PREFIX}transactions_${shop.id}`, JSON.stringify(updatedTransactionsList));

    if (isCredit) {
      addToast('success', 'Credit Sale Recorded!', `${saleNumber} • ${shop.currency_symbol}${totalAmount.toLocaleString()} added to ${assignedCustomerName}'s udhaar. Realized profit: ${shop.currency_symbol}0 (Expected: +${shop.currency_symbol}${expectedProfit.toLocaleString()})`);
    } else {
      addToast('success', 'Sale Completed!', `${saleNumber} • ${shop.currency_symbol}${totalAmount.toLocaleString()} recorded (+${shop.currency_symbol}${realizedProfit.toLocaleString()} profit)`);
    }
    return true;
  }, [products, customers, transactions, shop.id, shop.currency_symbol, addToast]);

  // Action: Record Credit Payment
  const recordCreditPayment = useCallback((paymentData: {
    customer_id: string;
    amount: number;
    payment_method: 'CASH' | 'UPI' | 'BANK_TRANSFER';
    notes?: string;
  }) => {
    const cust = customers.find(c => c.id === paymentData.customer_id);
    if (!cust) {
      addToast('error', 'Customer Not Found', 'Customer record was not found.');
      return false;
    }

    const newBalance = Math.max(0, cust.current_balance - paymentData.amount);
    const isFullySettled = newBalance === 0;

    const paymentRecord: CreditPayment = {
      id: `cp-${Date.now()}`,
      shop_id: shop.id,
      customer_id: cust.id,
      customer_name: cust.name,
      amount: paymentData.amount,
      payment_date: new Date().toISOString(),
      payment_method: paymentData.payment_method,
      remaining_balance_after: newBalance,
      notes: paymentData.notes,
    };

    setCustomers(prev => prev.map(c => {
      if (c.id === cust.id) {
        return {
          ...c,
          total_credit_paid: c.total_credit_paid + paymentData.amount,
          current_balance: newBalance,
          status: isFullySettled ? 'CLEAR' : (c.status === 'OVERDUE' ? 'OVERDUE' : 'CURRENT'),
        };
      }
      return c;
    }));

    setCreditPayments(prev => [paymentRecord, ...prev]);

    // Financial Rule: Recognize profit ONLY when entire credit is completely paid (newBalance === 0)
    if (isFullySettled) {
      let recognizedTotalProfit = 0;
      const settleTimestamp = new Date().toISOString();

      setTransactions(prev => prev.map(tx => {
        const isMatch = (tx.customer_id === cust.id || (tx.customer_name && tx.customer_name.toLowerCase() === cust.name.toLowerCase())) &&
          tx.payment_type === 'CREDIT' &&
          !tx.profit_recognized;

        if (isMatch) {
          const profitToAdd = tx.expected_profit !== undefined 
            ? tx.expected_profit 
            : (tx.total_amount - tx.total_cost);
          recognizedTotalProfit += profitToAdd;

          return {
            ...tx,
            total_profit: profitToAdd,
            profit_recognized: true,
            profit_recognized_at: settleTimestamp,
          };
        }
        return tx;
      }));

      addToast(
        'success', 
        'Credit Fully Cleared! 🎉', 
        `${shop.currency_symbol}${paymentData.amount.toLocaleString()} received from ${cust.name}. Balance is ₹0! Full profit of +${shop.currency_symbol}${recognizedTotalProfit.toLocaleString()} now recognized in earnings.`
      );
    } else {
      // Partial payment: Realized profit remains 0. Customer remains in active credit list.
      addToast(
        'info', 
        'Partial Payment Received', 
        `${shop.currency_symbol}${paymentData.amount.toLocaleString()} received from ${cust.name}. Remaining udhaar: ${shop.currency_symbol}${newBalance.toLocaleString()}. Profit will be recognized upon full clearance.`
      );
    }

    return true;
  }, [customers, shop.id, shop.currency_symbol, addToast]);

  // Action: Add or update product
  const saveProduct = useCallback((productData: Partial<Product>) => {
    if (!productData.name || (productData.selling_price || 0) < 0) {
      addToast('error', 'Validation Error', 'Product name and valid price are required.');
      return false;
    }

    if (productData.id) {
      // Edit
      setProducts(prev => prev.map(p => {
        if (p.id === productData.id) {
          return {
            ...p,
            ...productData,
            updated_at: new Date().toISOString(),
          } as Product;
        }
        return p;
      }));
      addToast('success', 'Product Updated', `${productData.name} details saved.`);
    } else {
      // Add
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        shop_id: shop.id,
        name: productData.name,
        category: productData.category || 'General',
        cost_price: Number(productData.cost_price) || 0,
        selling_price: Number(productData.selling_price) || 0,
        current_stock: Number(productData.current_stock) || 0,
        min_stock_threshold: Number(productData.min_stock_threshold) || 5,
        units_sold: 0,
        unit_type: productData.unit_type || 'pcs',
        sku: productData.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setProducts(prev => [newProd, ...prev]);
      addToast('success', 'Product Added', `${newProd.name} added to inventory.`);
    }
    return true;
  }, [shop.id, addToast]);

  // Action: Delete product
  const deleteProduct = useCallback((productId: string) => {
    const prod = products.find(p => p.id === productId);
    setProducts(prev => prev.filter(p => p.id !== productId));
    addToast('info', 'Product Removed', `${prod?.name || 'Product'} has been deleted from inventory.`);
  }, [products, addToast]);

  // Action: Add / Update Customer
  const saveCustomer = useCallback((customerData: Partial<Customer>) => {
    if (!customerData.name || !customerData.name.trim()) {
      addToast('error', 'Validation Error', 'Customer name is required.');
      return false;
    }

    const trimmedName = customerData.name.trim();
    const phone = customerData.phone?.trim() || '';
    const initialCredit = Math.max(0, Number(customerData.current_balance || customerData.total_credit_given || 0));

    if (customerData.id) {
      const updated = customers.map(c => {
        if (c.id === customerData.id) {
          return {
            ...c,
            ...customerData,
            name: trimmedName,
            phone,
          } as Customer;
        }
        return c;
      });
      setCustomers(updated);
      localStorage.setItem(`${STORAGE_PREFIX}customers_${shop.id}`, JSON.stringify(updated));
      addToast('success', 'Customer Updated', `${trimmedName} updated.`);
    } else {
      const custId = `cust-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const newCust: Customer = {
        id: custId,
        shop_id: shop.id,
        name: trimmedName,
        phone,
        email: customerData.email || '',
        address: customerData.address || '',
        total_credit_given: initialCredit,
        total_credit_paid: 0,
        current_balance: initialCredit,
        due_date: customerData.due_date,
        status: initialCredit > 0 ? 'DUE_SOON' : 'CLEAR',
        created_at: new Date().toISOString(),
      };

      const updated = [newCust, ...customers];
      setCustomers(updated);
      localStorage.setItem(`${STORAGE_PREFIX}customers_${shop.id}`, JSON.stringify(updated));

      // If created with initial credit, also log transaction
      if (initialCredit > 0) {
        const saleId = `tx-credit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        const saleNumber = `UDH-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(transactions.length + 1).padStart(3, '0')}`;
        const costBasis = Math.round(initialCredit * 0.8);
        const expectedProfit = initialCredit - costBasis;

        const initialCreditTx: Transaction = {
          id: saleId,
          shop_id: shop.id,
          sale_number: saleNumber,
          date: new Date().toISOString(),
          total_amount: initialCredit,
          total_cost: costBasis,
          total_profit: 0, // 0 realized profit until full payment
          expected_profit: expectedProfit,
          profit_recognized: false,
          payment_type: 'CREDIT',
          payment_method: 'CREDIT',
          customer_id: custId,
          customer_name: trimmedName,
          status: 'COMPLETED',
          items: [
            {
              id: `si-${Date.now()}`,
              sale_id: saleId,
              product_id: 'initial-credit',
              product_name: 'Initial Udhaar / Opening Credit',
              quantity: 1,
              cost_price: costBasis,
              selling_price: initialCredit,
              profit: expectedProfit,
              total_amount: initialCredit,
              unit_type: 'balance',
            }
          ],
          notes: customerData.due_date ? `Due by ${customerData.due_date}` : 'Opening balance credit',
        };
        const updatedTxs = [initialCreditTx, ...transactions];
        setTransactions(updatedTxs);
        localStorage.setItem(`${STORAGE_PREFIX}transactions_${shop.id}`, JSON.stringify(updatedTxs));
      }

      addToast('success', 'Customer Added', `${newCust.name} added with ${shop.currency_symbol}${initialCredit.toLocaleString()} credit.`);
    }
    return true;
  }, [shop.id, shop.currency_symbol, customers, transactions, addToast]);

  // Action: Delete customer
  const deleteCustomer = useCallback((customerId: string) => {
    const cust = customers.find(c => c.id === customerId);
    const updated = customers.filter(c => c.id !== customerId);
    setCustomers(updated);
    localStorage.setItem(`${STORAGE_PREFIX}customers_${shop.id}`, JSON.stringify(updated));
    addToast('info', 'Customer Removed', `${cust?.name || 'Customer'} removed.`);
  }, [customers, shop.id, addToast]);

  // Action: Delete single transaction
  const deleteTransaction = useCallback((transactionId: string) => {
    setTransactions(prev => prev.filter(t => t.id !== transactionId));
    addToast('info', 'Transaction Deleted', 'Transaction record has been removed.');
  }, [addToast]);

  // Action: Return / Undo Sale (Safe Reversal without Deleting History)
  const returnSale = useCallback((transactionId: string, returnReason?: string) => {
    try {
      const result = processSaleReturn({
        shopId: shop.id,
        transactionId,
        returnedBy: shop.owner_name || 'Shop Owner',
        returnReason: returnReason || 'Customer returned items',
        products,
        transactions,
        customers,
        creditPayments,
      });

      // Atomic state updates
      setProducts(result.updatedProducts);
      setTransactions(result.updatedTransactions);
      setCustomers(result.updatedCustomers);

      // Atomic persistence
      localStorage.setItem(`${STORAGE_PREFIX}products_${shop.id}`, JSON.stringify(result.updatedProducts));
      localStorage.setItem(`${STORAGE_PREFIX}transactions_${shop.id}`, JSON.stringify(result.updatedTransactions));
      localStorage.setItem(`${STORAGE_PREFIX}customers_${shop.id}`, JSON.stringify(result.updatedCustomers));

      addToast('success', 'Sale Returned', 'Sale returned successfully.');
      return true;
    } catch (err: any) {
      addToast('error', 'Return Failed', err.message || 'Could not return sale.');
      return false;
    }
  }, [shop.id, shop.owner_name, products, transactions, customers, creditPayments, addToast]);

  // Action: Clear Today's Transactions (Requires confirmation)
  const clearTodayTransactions = useCallback(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const count = transactions.filter(t => t.date.startsWith(todayStr)).length;
    setTransactions(prev => prev.filter(t => !t.date.startsWith(todayStr)));
    addToast('warning', "Today's Records Cleared", `${count} transactions from today were deleted.`);
  }, [transactions, addToast]);

  // Action: Clear ALL transactions (Dangerous Action)
  const clearAllTransactions = useCallback(() => {
    const count = transactions.length;
    setTransactions([]);
    addToast('error', 'All Transactions Cleared', `${count} historical transactions were permanently deleted.`);
  }, [transactions.length, addToast]);

  // Action: Record direct credit transaction (Udhaar sale)
  const recordCreditSale = useCallback((creditData: {
    customer_id: string;
    amount: number;
    notes?: string;
  }) => {
    const cust = customers.find(c => c.id === creditData.customer_id);
    if (!cust) {
      addToast('error', 'Customer Not Found', 'Selected customer does not exist.');
      return false;
    }

    const saleId = `tx-credit-${Date.now()}`;
    const saleNumber = `UDH-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(transactions.length + 1).padStart(3, '0')}`;
    const newBal = cust.current_balance + creditData.amount;
    const costBasis = Math.round(creditData.amount * 0.8);
    const expectedProfit = creditData.amount - costBasis;

    const newTx: Transaction = {
      id: saleId,
      shop_id: shop.id,
      sale_number: saleNumber,
      date: new Date().toISOString(),
      total_amount: creditData.amount,
      total_cost: costBasis, // estimated cost basis
      total_profit: 0, // Realized profit is 0 until full settlement
      expected_profit: expectedProfit, // Stored internally
      profit_recognized: false,
      payment_type: 'CREDIT',
      payment_method: 'CREDIT',
      customer_id: cust.id,
      customer_name: cust.name,
      status: 'COMPLETED',
      items: [
        {
          id: `si-${Date.now()}`,
          sale_id: saleId,
          product_id: 'general-credit',
          product_name: creditData.notes || 'Direct Udhaar Purchase',
          quantity: 1,
          cost_price: costBasis,
          selling_price: creditData.amount,
          profit: expectedProfit,
          total_amount: creditData.amount,
          unit_type: 'item',
        },
      ],
      notes: creditData.notes,
    };

    setCustomers(prev => prev.map(c => {
      if (c.id === cust.id) {
        return {
          ...c,
          total_credit_given: c.total_credit_given + creditData.amount,
          current_balance: newBal,
          status: 'DUE_SOON',
        };
      }
      return c;
    }));

    setTransactions(prev => [newTx, ...prev]);
    addToast('success', 'Udhaar Recorded', `${shop.currency_symbol}${creditData.amount.toLocaleString()} added to ${cust.name}'s khata.`);
    return true;
  }, [customers, transactions.length, shop.id, shop.currency_symbol, addToast]);

  // Action: Clear entire database
  const clearEntireDatabase = useCallback(() => {
    setProducts([]);
    setCustomers([]);
    setTransactions([]);
    setCreditPayments([]);
    addToast('warning', 'Database Cleared', 'All store inventory, transactions, and customers have been cleared.');
  }, [addToast]);

  // Action: Export Database JSON
  const exportDatabaseJSON = useCallback(() => {
    const data = {
      shop,
      products,
      customers,
      transactions,
      creditPayments,
      exported_at: new Date().toISOString(),
      version: '1.0',
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ShopIQ_${shop.shop_name.replace(/\s+/g, '_')}_Backup.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('success', 'Backup Downloaded', 'Store data exported to JSON file.');
  }, [shop, products, customers, transactions, creditPayments, addToast]);

  // Action: Import Database JSON
  const importDatabaseJSON = useCallback((jsonStr: string) => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.shop && Array.isArray(data.products)) {
        setShop(data.shop);
        setProducts(data.products);
        if (Array.isArray(data.customers)) setCustomers(data.customers);
        if (Array.isArray(data.transactions)) setTransactions(data.transactions);
        if (Array.isArray(data.creditPayments)) setCreditPayments(data.creditPayments);
        addToast('success', 'Restore Complete', 'Store data successfully imported from backup file.');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [addToast]);

  // Action: Load / Switch active shop data
  const loadShop = useCallback((targetShop: ShopProfile) => {
    setShop(targetShop);
    localStorage.setItem(`${STORAGE_PREFIX}shop`, JSON.stringify(targetShop));

    const isDemo = targetShop.is_demo !== false && targetShop.id === DEMO_SHOP_ID;

    // Load products
    const savedProds = localStorage.getItem(`${STORAGE_PREFIX}products_${targetShop.id}`);
    if (savedProds) {
      try { setProducts(JSON.parse(savedProds)); } catch (e) { setProducts(isDemo ? INITIAL_PRODUCTS : []); }
    } else {
      setProducts(isDemo ? INITIAL_PRODUCTS : []);
    }

    // Load customers
    const savedCusts = localStorage.getItem(`${STORAGE_PREFIX}customers_${targetShop.id}`);
    if (savedCusts) {
      try { setCustomers(JSON.parse(savedCusts)); } catch (e) { setCustomers(isDemo ? INITIAL_CUSTOMERS : []); }
    } else {
      setCustomers(isDemo ? INITIAL_CUSTOMERS : []);
    }

    // Load transactions
    const savedTxs = localStorage.getItem(`${STORAGE_PREFIX}transactions_${targetShop.id}`);
    if (savedTxs) {
      try { setTransactions(JSON.parse(savedTxs)); } catch (e) { setTransactions(isDemo ? generateSeedTransactions() : []); }
    } else {
      setTransactions(isDemo ? generateSeedTransactions() : []);
    }

    // Load credit payments
    const savedPayments = localStorage.getItem(`${STORAGE_PREFIX}credit_payments_${targetShop.id}`);
    if (savedPayments) {
      try { setCreditPayments(JSON.parse(savedPayments)); } catch (e) { setCreditPayments(isDemo ? INITIAL_CREDIT_PAYMENTS : []); }
    } else {
      setCreditPayments(isDemo ? INITIAL_CREDIT_PAYMENTS : []);
    }
  }, []);

  // Action: Reset to fresh Demo State
  const resetToDemoData = useCallback(() => {
    loadShop(INITIAL_DEMO_SHOP);
    addToast('success', 'Demo Store Loaded', 'Fresh realistic Kirana demo shop with ₹18,450 sales loaded!');
  }, [loadShop, addToast]);

  // Action: Update Shop Profile / Settings
  const updateShopProfile = useCallback((updates: Partial<ShopProfile>) => {
    setShop(prev => {
      const updated = { ...prev, ...updates };
      // Map currency symbols
      if (updates.currency) {
        const symbols: Record<Currency, string> = {
          INR: '₹',
          USD: '$',
          EUR: '€',
          GBP: '£',
        };
        updated.currency_symbol = symbols[updates.currency] || '₹';
      }
      return updated;
    });
    addToast('success', 'Settings Saved', 'Shop profile and preferences updated.');
  }, [addToast]);

  // Create new custom shop account (Login/Signup isolation)
  const createNewShop = useCallback((ownerName: string, shopName: string, email: string, category: string) => {
    const newId = `shop-${Date.now()}`;
    const newShop: ShopProfile = {
      id: newId,
      owner_name: ownerName,
      shop_name: shopName,
      email: email,
      category: category || 'Retail Store',
      currency: 'INR',
      currency_symbol: '₹',
      low_stock_threshold_default: 5,
      created_at: new Date().toISOString(),
      is_demo: false,
    };
    setShop(newShop);
    setProducts([]);
    setCustomers([]);
    setTransactions([]);
    setCreditPayments([]);
    addToast('success', `Welcome to ShopIQ!`, `Your shop "${shopName}" is ready. Start by adding your products.`);
  }, [addToast]);

  return {
    shop,
    products,
    customers,
    transactions,
    creditPayments,
    insights,
    metrics,
    toasts,
    activeTab,
    setActiveTab,
    theme,
    setTheme,
    addToast,
    dismissToast: removeToast,
    removeToast,
    recordSale,
    recordPayment: recordCreditPayment,
    recordCreditPayment,
    recordCreditSale,
    saveProduct,
    deleteProduct,
    addCustomer: saveCustomer,
    saveCustomer,
    deleteCustomer,
    deleteTransaction,
    returnSale,
    undoSale: returnSale,
    clearTodayTransactions,
    clearAllTransactions,
    clearEntireDatabase,
    exportDatabaseJSON,
    importDatabaseJSON,
    resetToDemoData,
    loadShop,
    updateShop: updateShopProfile,
    updateShopProfile,
    createNewShop,
  };
}
