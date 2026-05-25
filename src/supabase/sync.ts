/**
 * Supabase sync service — handles pull/push between local IndexedDB and Supabase.
 * 
 * Strategy:
 * - On app launch: pull all data from Supabase, upsert into local Dexie
 * - On every write: save locally first (instant), then push to Supabase (background)
 * - Cross-device: share the same sync_code across devices for seamless sync
 */
import { supabase, getSyncCode } from './client';
import { db } from '../store/db';

// ── Table name mapping ───────────────────────────────────────────
const TABLE_MAP = {
  transactions: 'transactions',
  wishes: 'wishes',
  accounts: 'accounts',
  budgets: 'budgets',
  tags: 'tags',
  debts: 'debts',
  recurringRules: 'recurring_rules',
} as const;

type TableName = keyof typeof TABLE_MAP;

// ── Pull: fetch all rows from Supabase and upsert into local Dexie ─
async function pullTable(
  tableName: TableName,
  localTable: any
): Promise<number> {
  const code = getSyncCode();
  const { data, error } = await supabase
    .from(TABLE_MAP[tableName])
    .select('*')
    .eq('sync_code', code);

  if (error) {
    console.error(`[sync] pull ${tableName} failed:`, error);
    return 0;
  }

  if (!data || data.length === 0) return 0;

  // Upsert into local Dexie — bulkPut overwrites existing rows by id
  // Strip Supabase metadata fields
  const records = data.map((row: any) => {
    const { updated_at, sync_code, ...clean } = row;
    return clean;
  });

  await localTable.bulkPut(records);
  return records.length;
}

// ── Push: upsert a single record to Supabase ─────────────────────
async function pushRecord(tableName: TableName, record: any): Promise<void> {
  const code = getSyncCode();
  const payload = { ...record, sync_code: code };

  const { error } = await supabase
    .from(TABLE_MAP[tableName])
    .upsert(payload, { onConflict: 'id' });

  if (error) {
    console.error(`[sync] push ${tableName}/${record.id} failed:`, error);
  }
}

// ── Push all local records to Supabase ───────────────────────────
async function pushTable(tableName: TableName, localTable: any): Promise<number> {
  const records = await localTable.toArray();
  if (records.length === 0) return 0;

  const code = getSyncCode();
  const payloads = records.map((r: any) => ({ ...r, sync_code: code }));

  // Batch upsert in chunks of 100
  let count = 0;
  for (let i = 0; i < payloads.length; i += 100) {
    const chunk = payloads.slice(i, i + 100);
    const { error } = await supabase
      .from(TABLE_MAP[tableName])
      .upsert(chunk, { onConflict: 'id' });

    if (error) {
      console.error(`[sync] push batch ${tableName} failed:`, error);
    } else {
      count += chunk.length;
    }
  }
  return count;
}

// ── Full sync: pull everything, then push local changes ──────────
export async function fullSync(): Promise<{ pulled: number; pushed: number }> {
  let pulled = 0;
  let pushed = 0;

  try {
    // Pull from Supabase first
    pulled += await pullTable('transactions', db.transactions);
    pulled += await pullTable('wishes', db.wishes);
    pulled += await pullTable('accounts', db.accounts);
    pulled += await pullTable('budgets', db.budgets);
    pulled += await pullTable('tags', db.tags);
    pulled += await pullTable('debts', db.debts);
    pulled += await pullTable('recurringRules', db.recurringRules);

    // Then push any local-only records
    pushed += await pushTable('transactions', db.transactions);
    pushed += await pushTable('wishes', db.wishes);
    pushed += await pushTable('accounts', db.accounts);
    pushed += await pushTable('budgets', db.budgets);
    pushed += await pushTable('tags', db.tags);
    pushed += await pushTable('debts', db.debts);
    pushed += await pushTable('recurringRules', db.recurringRules);

    console.log(`[sync] pulled ${pulled}, pushed ${pushed}`);
  } catch (err) {
    console.error('[sync] fullSync error:', err);
  }

  return { pulled, pushed };
}

// ── Sync a single record after local write ───────────────────────
export async function syncRecord(
  table: TableName,
  record: any
): Promise<void> {
  try {
    await pushRecord(table, record);
  } catch (err) {
    console.error(`[sync] syncRecord ${table} failed:`, err);
    // Don't throw — local save already succeeded, sync will retry on next full sync
  }
}

// ── Delete a record from Supabase ────────────────────────────────
export async function deleteRemote(table: TableName, id: string): Promise<void> {
  try {
    const code = getSyncCode();
    await supabase
      .from(TABLE_MAP[table])
      .delete()
      .eq('id', id)
      .eq('sync_code', code);
  } catch (err) {
    console.error(`[sync] deleteRemote ${table}/${id} failed:`, err);
  }
}
