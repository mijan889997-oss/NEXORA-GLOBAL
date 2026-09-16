/**
 * NEXVORA GLOBAL - Production Database Sanitizer & Reset Script
 * Purges all development/test accounts, test orders, test transactions, and test withdrawals.
 * Retains only the Super Admin account (0 balance), roles, starter tasks, courses, products, and affiliate programs.
 */

import { db } from '../server/db';

async function main() {
  console.log('[NEXVORA] Resetting database to clean production state...');
  db.resetToCleanState();

  const users = db.getTable('users');
  const transactions = db.getTable('transactions');
  const orders = db.getTable('orders');
  const withdrawals = db.getTable('withdrawals');
  const payments = db.getTable('payments');

  console.log(`[NEXVORA] Clean Database State Summary:`);
  console.log(`- Users: ${users.length} (${users.map((u) => u.email).join(', ')})`);
  console.log(`- Wallets: ${db.getTable('wallets').length} (Super Admin balance: $${db.getTable('wallets')[0]?.availableBalance || 0})`);
  console.log(`- Transactions: ${transactions.length}`);
  console.log(`- Orders: ${orders.length}`);
  console.log(`- Withdrawals: ${withdrawals.length}`);
  console.log(`- Payment Gateways: ${payments.length} (Configured: ${payments.filter((p) => p.isConfigured).length})`);
  console.log(`[NEXVORA] Database is 100% clean and production-ready.`);
}

main().catch((err) => {
  console.error('[NEXVORA] Failed to clean database:', err);
  process.exit(1);
});
