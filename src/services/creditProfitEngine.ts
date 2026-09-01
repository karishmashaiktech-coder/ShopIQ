import { Customer, Transaction, CreditPayment, SaleItem, Product } from '../types';

/**
 * Credit & Profit Accounting Engine for ShopIQ
 * 
 * CORE BUSINESS RULES:
 * 1. PAID SALE:
 *    - Immediately recognizes realized profit (total_amount - total_cost).
 *    - profit_recognized = true
 * 
 * 2. CREDIT SALE (Udhaar):
 *    - Customer owes total_amount.
 *    - Realized earnings/profit = 0 initially (total_profit = 0).
 *    - Expected profit is stored internally (expected_profit = total_amount - total_cost).
 *    - profit_recognized = false
 * 
 * 3. PARTIAL CREDIT PAYMENT:
 *    - Reduces customer's outstanding balance (current_balance > 0).
 *    - Realized profit REMAINS 0. Customer stays in active credit list.
 * 
 * 4. FULL CREDIT PAYMENT (Credit completely cleared):
 *    - When customer's current_balance reaches exactly 0:
 *    - Recognizes the FULL accumulated expected profit across all unpaid credit transactions for this customer at once!
 *    - Sets total_profit = expected_profit and profit_recognized = true for each cleared credit transaction.
 *    - Customer disappears from the ACTIVE credit list (outstanding > 0), but full history is preserved.
 *    - Double-counting is strictly prevented (profit_recognized flag).
 */

export interface CreateSaleParams {
  shopId: string;
  items: SaleItem[];
  paymentType: 'PAID' | 'CREDIT';
  paymentMethod: 'CASH' | 'UPI' | 'CARD' | 'CREDIT';
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  existingCustomers: Customer[];
  saleIndex: number;
}

export interface CreateSaleResult {
  transaction: Transaction;
  updatedCustomer?: Customer;
  newCustomer?: Customer;
  realizedProfit: number;
  expectedProfit: number;
}

export function processSaleAccounting(params: CreateSaleParams): CreateSaleResult {
  const {
    shopId,
    items,
    paymentType,
    paymentMethod,
    customerId,
    customerName,
    customerPhone,
    notes,
    existingCustomers,
    saleIndex,
  } = params;

  const totalAmount = items.reduce((sum, i) => sum + i.total_amount, 0);
  const totalCost = items.reduce((sum, i) => sum + i.cost_price * i.quantity, 0);
  const calculatedProfit = totalAmount - totalCost;

  const isCredit = paymentType === 'CREDIT';
  const realizedProfit = isCredit ? 0 : calculatedProfit;
  const expectedProfit = calculatedProfit;

  const saleId = `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
  const dateStr = new Date().toISOString();
  const saleNumber = `INV-${dateStr.slice(0, 10).replace(/-/g, '')}-${String(saleIndex + 1).padStart(3, '0')}`;

  let assignedCustomerId = customerId;
  let assignedCustomerName = customerName || (isCredit ? 'Credit Customer' : 'Walk-in Customer');
  let updatedCustomer: Customer | undefined;
  let newCustomer: Customer | undefined;

  if (isCredit) {
    let targetCust = assignedCustomerId 
      ? existingCustomers.find(c => c.id === assignedCustomerId) 
      : undefined;

    if (!targetCust && assignedCustomerName && assignedCustomerName !== 'Walk-in Customer' && assignedCustomerName !== 'Credit Customer') {
      targetCust = existingCustomers.find(c => c.name.toLowerCase() === assignedCustomerName.toLowerCase());
    }

    if (targetCust) {
      assignedCustomerId = targetCust.id;
      assignedCustomerName = targetCust.name;
      const newBalance = targetCust.current_balance + totalAmount;
      updatedCustomer = {
        ...targetCust,
        total_credit_given: targetCust.total_credit_given + totalAmount,
        current_balance: newBalance,
        status: 'DUE_SOON',
        due_date: notes?.includes('Due by') ? notes.replace('Due by ', '').trim() : targetCust.due_date,
      };
    } else {
      // Create new customer record for this credit
      const newCustId = assignedCustomerId || `cust-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      assignedCustomerId = newCustId;
      newCustomer = {
        id: newCustId,
        shop_id: shopId,
        name: assignedCustomerName,
        phone: customerPhone || '',
        total_credit_given: totalAmount,
        total_credit_paid: 0,
        current_balance: totalAmount,
        status: 'DUE_SOON',
        created_at: dateStr,
        due_date: notes?.includes('Due by') ? notes.replace('Due by ', '').trim() : undefined,
      };
      updatedCustomer = newCustomer;
    }
  }

  const transaction: Transaction = {
    id: saleId,
    shop_id: shopId,
    sale_number: saleNumber,
    date: dateStr,
    total_amount: totalAmount,
    total_cost: totalCost,
    total_profit: realizedProfit, // 0 for credit sales until full payment
    expected_profit: expectedProfit,
    profit_recognized: !isCredit,
    payment_type: paymentType,
    payment_method: paymentMethod,
    customer_id: assignedCustomerId,
    customer_name: assignedCustomerName,
    status: 'COMPLETED',
    items,
    notes,
  };

  return {
    transaction,
    updatedCustomer,
    newCustomer,
    realizedProfit,
    expectedProfit,
  };
}

export interface CreditPaymentParams {
  shopId: string;
  customerId: string;
  amount: number;
  paymentMethod: 'CASH' | 'UPI' | 'BANK_TRANSFER';
  notes?: string;
  customers: Customer[];
  transactions: Transaction[];
}

export interface CreditPaymentResult {
  updatedCustomer: Customer;
  updatedTransactions: Transaction[];
  paymentRecord: CreditPayment;
  newlyRecognizedProfit: number;
  isFullySettled: boolean;
  remainingBalance: number;
}

export function processCreditSettlement(params: CreditPaymentParams): CreditPaymentResult {
  const {
    shopId,
    customerId,
    amount,
    paymentMethod,
    notes,
    customers,
    transactions,
  } = params;

  const cust = customers.find(c => c.id === customerId);
  if (!cust) {
    throw new Error(`Customer with ID ${customerId} not found.`);
  }

  const newBalance = Math.max(0, cust.current_balance - amount);
  const isFullySettled = newBalance === 0;

  const paymentRecord: CreditPayment = {
    id: `cp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    shop_id: shopId,
    customer_id: cust.id,
    customer_name: cust.name,
    amount,
    payment_date: new Date().toISOString(),
    payment_method: paymentMethod,
    remaining_balance_after: newBalance,
    notes,
  };

  const updatedCustomer: Customer = {
    ...cust,
    total_credit_paid: cust.total_credit_paid + amount,
    current_balance: newBalance,
    status: isFullySettled ? 'CLEAR' : (cust.status === 'OVERDUE' ? 'OVERDUE' : 'CURRENT'),
  };

  let newlyRecognizedProfit = 0;
  let updatedTransactions = transactions;

  // RULE: Recognize profit ONLY when the customer's entire credit is completely paid (newBalance === 0)
  if (isFullySettled) {
    const timestamp = new Date().toISOString();
    updatedTransactions = transactions.map(tx => {
      const isMatchingCreditTx = 
        (tx.customer_id === cust.id || (tx.customer_name && tx.customer_name.toLowerCase() === cust.name.toLowerCase())) &&
        tx.payment_type === 'CREDIT' &&
        !tx.profit_recognized;

      if (isMatchingCreditTx) {
        const profitToRecognize = tx.expected_profit !== undefined 
          ? tx.expected_profit 
          : (tx.total_amount - tx.total_cost);

        newlyRecognizedProfit += profitToRecognize;

        return {
          ...tx,
          total_profit: profitToRecognize,
          profit_recognized: true,
          profit_recognized_at: timestamp,
        };
      }
      return tx;
    });
  }

  return {
    updatedCustomer,
    updatedTransactions,
    paymentRecord,
    newlyRecognizedProfit,
    isFullySettled,
    remainingBalance: newBalance,
  };
}

/**
 * Filter to get only active credit customers (those who currently owe money)
 */
export function getActiveCreditCustomers(customers: Customer[]): Customer[] {
  return customers.filter(c => c.current_balance > 0);
}

/**
 * Retrieve complete preserved history for a customer even if balance is 0
 */
export function getCustomerFullHistory(
  customerId: string,
  customers: Customer[],
  transactions: Transaction[],
  creditPayments: CreditPayment[]
) {
  const customer = customers.find(c => c.id === customerId);
  const customerTxs = transactions.filter(t => t.customer_id === customerId);
  const customerPayments = creditPayments.filter(p => p.customer_id === customerId);

  return {
    customer,
    transactions: customerTxs,
    payments: customerPayments,
    totalCreditGiven: customer?.total_credit_given || 0,
    totalCreditPaid: customer?.total_credit_paid || 0,
    currentBalance: customer?.current_balance || 0,
    isCleared: (customer?.current_balance || 0) === 0,
  };
}

export interface ProcessSaleReturnParams {
  shopId: string;
  transactionId: string;
  returnedBy?: string;
  returnReason?: string;
  products: Product[];
  transactions: Transaction[];
  customers: Customer[];
  creditPayments?: CreditPayment[];
}

export interface ProcessSaleReturnResult {
  updatedTransaction: Transaction;
  updatedTransactions: Transaction[];
  updatedProducts: Product[];
  updatedCustomers: Customer[];
  reversedSalesAmount: number;
  reversedCostAmount: number;
  reversedProfitAmount: number;
  restoredStockItems: { productId: string; productName: string; quantityRestored: number; newStock: number }[];
}

/**
 * Return / Undo Sale Engine for ShopIQ
 * 
 * CORE RETURN REVERSAL RULES:
 * 1. PAID SALE:
 *    - Restores product stock for all items sold in this transaction.
 *    - Reverses the sale amount, wholesale cost/investment, and realized profit.
 *    - Marks transaction as 'RETURNED' with returned_at, returned_by, and return_reason.
 *    - Never physically deletes the historical record.
 * 
 * 2. UNPAID CREDIT SALE (Udhaar):
 *    - Restores product stock.
 *    - Reverses customer's outstanding balance and total credit given without going negative.
 *    - If customer balance reaches 0, status becomes 'CLEAR' and they leave the ACTIVE credit list.
 *    - Realized profit was 0 and remains 0.
 * 
 * 3. FULLY PAID CREDIT SALE:
 *    - Restores product stock.
 *    - Reverses previously recognized realized profit from earnings totals.
 *    - Adjusts customer's total credit given and paid safely without negative balances.
 *    - Historical payments remain logged.
 * 
 * 4. PARTIALLY PAID CREDIT SALE:
 *    - Restores product stock.
 *    - Reverses customer credit obligation without negative balances.
 *    - Realized profit was 0 and remains 0 (no incorrect profit recognized).
 * 
 * 5. ATOMICITY & IDEMPOTENCY:
 *    - Validates shop ownership and ensures a returned sale cannot be returned twice.
 */
export function processSaleReturn(params: ProcessSaleReturnParams): ProcessSaleReturnResult {
  const {
    shopId,
    transactionId,
    returnedBy,
    returnReason,
    products,
    transactions,
    customers,
  } = params;

  const targetTx = transactions.find(t => t.id === transactionId);
  if (!targetTx) {
    throw new Error(`Transaction with ID "${transactionId}" was not found.`);
  }

  // Preserve shop-level authorization
  if (targetTx.shop_id !== shopId) {
    throw new Error(`Unauthorized: Transaction "${transactionId}" does not belong to shop "${shopId}".`);
  }

  // Prevent double returns
  if (targetTx.status === 'RETURNED') {
    throw new Error(`Transaction "${targetTx.sale_number}" has already been returned. Cannot return twice.`);
  }

  const timestamp = new Date().toISOString();

  // 1. Restore product stock for all items
  const restoredStockItems: { productId: string; productName: string; quantityRestored: number; newStock: number }[] = [];
  const updatedProducts = products.map(product => {
    const saleItem = targetTx.items.find(i => i.product_id === product.id);
    if (saleItem) {
      const restoredStock = product.current_stock + saleItem.quantity;
      const updatedSold = Math.max(0, product.units_sold - saleItem.quantity);
      restoredStockItems.push({
        productId: product.id,
        productName: product.name,
        quantityRestored: saleItem.quantity,
        newStock: restoredStock,
      });
      return {
        ...product,
        current_stock: restoredStock,
        units_sold: updatedSold,
        updated_at: timestamp,
      };
    }
    return product;
  });

  // 2. Calculate accounting reversals
  const reversedSalesAmount = targetTx.total_amount;
  const reversedCostAmount = targetTx.total_cost;
  // If profit was recognized (paid sale or cleared credit), reverse it; otherwise 0
  const reversedProfitAmount = targetTx.total_profit;

  // 3. Customer balance adjustments for credit transactions
  let updatedCustomers = customers;
  if (targetTx.payment_type === 'CREDIT' && targetTx.customer_id) {
    const cust = customers.find(c => c.id === targetTx.customer_id) ||
      customers.find(c => c.name.toLowerCase() === targetTx.customer_name?.toLowerCase());

    if (cust) {
      const saleAmount = targetTx.total_amount;
      const newCreditGiven = Math.max(0, cust.total_credit_given - saleAmount);
      
      let newCreditPaid = cust.total_credit_paid;
      let newBalance = cust.current_balance;

      if (cust.current_balance >= saleAmount) {
        // The credit from this sale was entirely unpaid
        newBalance = cust.current_balance - saleAmount;
      } else {
        // The credit was partially or fully paid:
        // The unpaid portion was cust.current_balance, the paid portion was (saleAmount - cust.current_balance)
        const paidPortion = saleAmount - cust.current_balance;
        newBalance = 0;
        newCreditPaid = Math.max(0, cust.total_credit_paid - paidPortion);
      }

      // Ensure balance is strictly non-negative
      newBalance = Math.max(0, newBalance);

      updatedCustomers = customers.map(c => {
        if (c.id === cust.id) {
          return {
            ...c,
            total_credit_given: newCreditGiven,
            total_credit_paid: newCreditPaid,
            current_balance: newBalance,
            status: newBalance === 0 ? 'CLEAR' : (c.status === 'OVERDUE' ? 'OVERDUE' : 'CURRENT'),
          } as Customer;
        }
        return c;
      });
    }
  }

  // 4. Mark transaction as RETURNED
  const updatedTransaction: Transaction = {
    ...targetTx,
    status: 'RETURNED',
    returned_at: timestamp,
    returned_by: returnedBy || 'Shop Owner',
    return_reason: returnReason || 'Customer returned items',
    total_profit: 0,
    profit_recognized: false,
  };

  const updatedTransactions = transactions.map(t => 
    t.id === targetTx.id ? updatedTransaction : t
  );

  return {
    updatedTransaction,
    updatedTransactions,
    updatedProducts,
    updatedCustomers,
    reversedSalesAmount,
    reversedCostAmount,
    reversedProfitAmount,
    restoredStockItems,
  };
}

