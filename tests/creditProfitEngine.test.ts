import {
  processSaleAccounting,
  processCreditSettlement,
  getActiveCreditCustomers,
  getCustomerFullHistory,
} from '../src/services/creditProfitEngine';
import { Customer, Transaction, SaleItem, CreditPayment } from '../src/types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

console.log('\n--- STARTING SHOP IQ CREDIT & PROFIT ENGINE VERIFICATION ---\n');

const shopId = 'demo-shop-test';

// TEST CASE 1: Paid sale -> full profit immediately
console.log('[TEST 1] Paid sale -> full profit immediately');
{
  const item: SaleItem = {
    id: 'item-1',
    sale_id: '',
    product_id: 'prod-1',
    product_name: 'Cooking Oil 1L',
    quantity: 1,
    cost_price: 400,
    selling_price: 500,
    profit: 100,
    total_amount: 500,
  };

  const result = processSaleAccounting({
    shopId,
    items: [item],
    paymentType: 'PAID',
    paymentMethod: 'CASH',
    customerName: 'Walk-in Customer',
    existingCustomers: [],
    saleIndex: 0,
  });

  assert(result.transaction.total_amount === 500, 'Sale amount is ₹500');
  assert(result.transaction.total_cost === 400, 'Cost/Investment is ₹400');
  assert(result.transaction.total_profit === 100, 'Realized profit is recognized immediately as ₹100');
  assert(result.transaction.profit_recognized === true, 'profit_recognized is true');
  assert(result.realizedProfit === 100, 'result.realizedProfit is ₹100');
}

// TEST CASE 2: Credit sale -> profit remains ₹0, expected profit stored internally
console.log('\n[TEST 2] Credit sale -> profit remains ₹0');
let testCustomer: Customer = {
  id: 'cust-ramesh',
  shop_id: shopId,
  name: 'Ramesh Patel',
  phone: '9876543210',
  total_credit_given: 0,
  total_credit_paid: 0,
  current_balance: 0,
  status: 'CLEAR',
  created_at: new Date().toISOString(),
};

let txList: Transaction[] = [];
let creditPaymentList: CreditPayment[] = [];

{
  const item: SaleItem = {
    id: 'item-2',
    sale_id: '',
    product_id: 'prod-2',
    product_name: 'Basmati Rice 5kg',
    quantity: 1,
    cost_price: 400,
    selling_price: 500,
    profit: 100,
    total_amount: 500,
  };

  const result = processSaleAccounting({
    shopId,
    items: [item],
    paymentType: 'CREDIT',
    paymentMethod: 'CREDIT',
    customerId: testCustomer.id,
    customerName: testCustomer.name,
    existingCustomers: [testCustomer],
    saleIndex: 1,
  });

  testCustomer = result.updatedCustomer!;
  txList.push(result.transaction);

  assert(result.transaction.total_amount === 500, 'Customer owes ₹500');
  assert(result.transaction.total_cost === 400, 'Investment is ₹400');
  assert(result.transaction.total_profit === 0, 'Realized profit is ₹0 for credit sale');
  assert(result.transaction.expected_profit === 100, 'Expected profit is stored internally as ₹100');
  assert(result.transaction.profit_recognized === false, 'profit_recognized is false');
  assert(testCustomer.current_balance === 500, 'Customer current balance is ₹500');

  const activeList = getActiveCreditCustomers([testCustomer]);
  assert(activeList.length === 1 && activeList[0].id === testCustomer.id, 'Customer is present in active credit list');
}

// TEST CASE 3: Partial credit payment -> profit remains ₹0
console.log('\n[TEST 3] Partial credit payment (pays ₹200 out of ₹500) -> profit remains ₹0');
{
  const settlement = processCreditSettlement({
    shopId,
    customerId: testCustomer.id,
    amount: 200,
    paymentMethod: 'UPI',
    customers: [testCustomer],
    transactions: txList,
  });

  testCustomer = settlement.updatedCustomer;
  txList = settlement.updatedTransactions;
  creditPaymentList.push(settlement.paymentRecord);

  assert(settlement.isFullySettled === false, 'Credit is not fully settled');
  assert(testCustomer.current_balance === 300, 'Outstanding balance is ₹300');
  assert(settlement.newlyRecognizedProfit === 0, 'Newly recognized profit is ₹0');
  
  const tx = txList.find(t => t.id === 'tx-ramesh-1' || t.customer_id === testCustomer.id)!;
  assert(tx.total_profit === 0, 'Transaction realized profit remains ₹0');
  assert(tx.profit_recognized === false, 'profit_recognized is still false');

  const activeList = getActiveCreditCustomers([testCustomer]);
  assert(activeList.length === 1, 'Customer still remains in active credit list');
}

// TEST CASE 4: Full credit payment -> entire expected profit is recognized
console.log('\n[TEST 4] Full credit payment (pays remaining ₹300) -> full ₹100 profit recognized at once');
{
  const settlement = processCreditSettlement({
    shopId,
    customerId: testCustomer.id,
    amount: 300,
    paymentMethod: 'CASH',
    customers: [testCustomer],
    transactions: txList,
  });

  testCustomer = settlement.updatedCustomer;
  txList = settlement.updatedTransactions;
  creditPaymentList.push(settlement.paymentRecord);

  assert(settlement.isFullySettled === true, 'Credit is now fully settled');
  assert(testCustomer.current_balance === 0, 'Outstanding balance is ₹0');
  assert(settlement.newlyRecognizedProfit === 100, 'Full ₹100 profit is recognized at once');

  const tx = txList.find(t => t.customer_id === testCustomer.id)!;
  assert(tx.total_profit === 100, 'Transaction total_profit is now ₹100');
  assert(tx.profit_recognized === true, 'Transaction profit_recognized is now true');
  assert(typeof tx.profit_recognized_at === 'string', 'Transaction profit_recognized_at timestamp is set');
}

// TEST CASE 5: Customer disappears from active credit list after full payment
console.log('\n[TEST 5] Customer disappears from active credit list');
{
  const activeList = getActiveCreditCustomers([testCustomer]);
  assert(activeList.length === 0, 'Customer does NOT appear in active credit list (outstanding = 0)');
}

// TEST CASE 6: Customer history remains completely available
console.log('\n[TEST 6] Customer history remains available');
{
  const history = getCustomerFullHistory(testCustomer.id, [testCustomer], txList, creditPaymentList);
  assert(history.customer !== undefined, 'Customer profile is intact');
  assert(history.transactions.length === 1, 'Transaction history is preserved');
  assert(history.payments.length === 2, 'Both payment records (₹200 and ₹300) are preserved');
  assert(history.totalCreditGiven === 500, 'Total credit given recorded accurately as ₹500');
  assert(history.totalCreditPaid === 500, 'Total credit paid recorded accurately as ₹500');
  assert(history.currentBalance === 0, 'Current balance is ₹0');
  assert(history.isCleared === true, 'Customer is marked cleared');
}

// TEST CASE 7: Profit cannot be recognized twice
console.log('\n[TEST 7] Profit cannot be recognized twice');
{
  const settlementRedundant = processCreditSettlement({
    shopId,
    customerId: testCustomer.id,
    amount: 0,
    paymentMethod: 'UPI',
    customers: [testCustomer],
    transactions: txList,
  });

  assert(settlementRedundant.newlyRecognizedProfit === 0, 'No additional profit is recognized on redundant settlement check');
  const tx = txList.find(t => t.customer_id === testCustomer.id)!;
  assert(tx.total_profit === 100, 'Transaction total_profit remains ₹100 (never double counted)');
}

// TEST CASE 8: Multiple credit sales for the same customer work correctly
console.log('\n[TEST 8] Multiple credit sales for the same customer');
let multiCust: Customer = {
  id: 'cust-priya',
  shop_id: shopId,
  name: 'Priya Sharma',
  phone: '9123456780',
  total_credit_given: 0,
  total_credit_paid: 0,
  current_balance: 0,
  status: 'CLEAR',
  created_at: new Date().toISOString(),
};
let multiTxs: Transaction[] = [];
let multiPayments: CreditPayment[] = [];

{
  // Sale 1: Cost 400, Sale 500, Expected Profit 100
  const sale1 = processSaleAccounting({
    shopId,
    items: [{
      id: 'item-m1',
      sale_id: '',
      product_id: 'prod-1',
      product_name: 'Product A',
      quantity: 1,
      cost_price: 400,
      selling_price: 500,
      profit: 100,
      total_amount: 500,
    }],
    paymentType: 'CREDIT',
    paymentMethod: 'CREDIT',
    customerId: multiCust.id,
    customerName: multiCust.name,
    existingCustomers: [multiCust],
    saleIndex: 0,
  });
  multiCust = sale1.updatedCustomer!;
  multiTxs.push(sale1.transaction);

  // Sale 2: Cost 200, Sale 250, Expected Profit 50
  const sale2 = processSaleAccounting({
    shopId,
    items: [{
      id: 'item-m2',
      sale_id: '',
      product_id: 'prod-2',
      product_name: 'Product B',
      quantity: 1,
      cost_price: 200,
      selling_price: 250,
      profit: 50,
      total_amount: 250,
    }],
    paymentType: 'CREDIT',
    paymentMethod: 'CREDIT',
    customerId: multiCust.id,
    customerName: multiCust.name,
    existingCustomers: [multiCust],
    saleIndex: 1,
  });
  multiCust = sale2.updatedCustomer!;
  multiTxs.push(sale2.transaction);

  assert(multiCust.current_balance === 750, 'Total outstanding balance is ₹750');
  assert(multiTxs[0].total_profit === 0, 'Sale 1 realized profit is ₹0');
  assert(multiTxs[1].total_profit === 0, 'Sale 2 realized profit is ₹0');
  assert(multiTxs[0].expected_profit === 100, 'Sale 1 expected profit is ₹100');
  assert(multiTxs[1].expected_profit === 50, 'Sale 2 expected profit is ₹50');
}

// TEST CASE 9: Multiple partial payments followed by full payment work correctly
console.log('\n[TEST 9] Multiple partial payments followed by full payment');
{
  // Partial 1: Pays ₹300 -> Remaining ₹450 -> Profit = 0
  const p1 = processCreditSettlement({
    shopId,
    customerId: multiCust.id,
    amount: 300,
    paymentMethod: 'UPI',
    customers: [multiCust],
    transactions: multiTxs,
  });
  multiCust = p1.updatedCustomer;
  multiTxs = p1.updatedTransactions;
  multiPayments.push(p1.paymentRecord);
  assert(multiCust.current_balance === 450, 'Balance is ₹450 after payment 1');
  assert(p1.newlyRecognizedProfit === 0, 'Profit realized is ₹0 after payment 1');

  // Partial 2: Pays ₹400 -> Remaining ₹50 -> Profit = 0
  const p2 = processCreditSettlement({
    shopId,
    customerId: multiCust.id,
    amount: 400,
    paymentMethod: 'CASH',
    customers: [multiCust],
    transactions: multiTxs,
  });
  multiCust = p2.updatedCustomer;
  multiTxs = p2.updatedTransactions;
  multiPayments.push(p2.paymentRecord);
  assert(multiCust.current_balance === 50, 'Balance is ₹50 after payment 2');
  assert(p2.newlyRecognizedProfit === 0, 'Profit realized is ₹0 after payment 2');

  // Final 3: Pays ₹50 -> Remaining ₹0 -> Full ₹150 profit recognized!
  const p3 = processCreditSettlement({
    shopId,
    customerId: multiCust.id,
    amount: 50,
    paymentMethod: 'UPI',
    customers: [multiCust],
    transactions: multiTxs,
  });
  multiCust = p3.updatedCustomer;
  multiTxs = p3.updatedTransactions;
  multiPayments.push(p3.paymentRecord);
  assert(multiCust.current_balance === 0, 'Balance is ₹0 after final payment');
  assert(p3.newlyRecognizedProfit === 150, 'Both credit sales recognized simultaneously (+₹100 + ₹50 = +₹150)');

  assert(multiTxs[0].total_profit === 100, 'Sale 1 profit is recognized as ₹100');
  assert(multiTxs[0].profit_recognized === true, 'Sale 1 profit_recognized is true');
  assert(multiTxs[1].total_profit === 50, 'Sale 2 profit is recognized as ₹50');
  assert(multiTxs[1].profit_recognized === true, 'Sale 2 profit_recognized is true');

  const active = getActiveCreditCustomers([multiCust]);
  assert(active.length === 0, 'Customer is removed from active credit list');
}

// TEST CASE 10: New customer creation during credit sale (e.g. Rahul)
console.log('\n[TEST 10] New customer creation during credit sale (e.g., Rahul)');
{
  const rahulSale = processSaleAccounting({
    shopId,
    items: [{
      id: 'item-rahul',
      sale_id: '',
      product_id: 'prod-rice',
      product_name: 'Rice',
      quantity: 5,
      cost_price: 40,
      selling_price: 50,
      profit: 50, // 5 * (50-40) = 50
      total_amount: 250, // 5 * 50 = 250
    }],
    paymentType: 'CREDIT',
    paymentMethod: 'CREDIT',
    customerName: 'Rahul',
    customerPhone: '9876500000',
    existingCustomers: [],
    saleIndex: 0,
  });

  assert(rahulSale.updatedCustomer !== undefined, 'Rahul customer is automatically created');
  assert(rahulSale.updatedCustomer!.name === 'Rahul', 'Customer name is Rahul');
  assert(rahulSale.updatedCustomer!.current_balance === 250, 'Rahul balance is ₹250');
  assert(rahulSale.updatedCustomer!.total_credit_given === 250, 'Total credit given is ₹250');
  assert(rahulSale.transaction.total_amount === 250, 'Transaction total is ₹250');
  assert(rahulSale.transaction.total_cost === 200, 'Transaction cost is ₹200 (5 * 40)');
  assert(rahulSale.transaction.total_profit === 0, 'Realized profit is ₹0 on credit sale');
  assert(rahulSale.transaction.expected_profit === 50, 'Expected profit is ₹50');
  assert(rahulSale.transaction.customer_id === rahulSale.updatedCustomer!.id, 'Transaction is linked to Rahul id');

  const active = getActiveCreditCustomers([rahulSale.updatedCustomer!]);
  assert(active.length === 1, 'Rahul appears in active credit customers list immediately');
  assert(active[0].name === 'Rahul' && active[0].current_balance === 250, 'Active list shows Rahul owes ₹250');
}

console.log('\n=========================================');
console.log('🎉 ALL 10 TEST CASES PASSED PERFECTLY! 🎉');
console.log('=========================================\n');
