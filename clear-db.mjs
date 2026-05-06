import { db } from './src/store/db.ts';
await db.wishes.clear();
await db.transactions.clear();
console.log('IndexedDB cleared!');
process.exit(0);
