import { db } from './src/store/db.js';

await db.transactions.clear();
await db.wishes.clear();
await db.accounts.clear();
await db.budgets.clear();
console.log('✅ 所有数据已清除：transactions + wishes + accounts + budgets');
process.exit(0);
