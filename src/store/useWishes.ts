import { useState, useEffect, useCallback } from 'react';
import { db } from './db';
import type { Wish } from './db';
import { syncRecord, deleteRemote } from '../supabase/sync';

export function useWishes() {
  const [wishes, setWishes] = useState<Wish[]>([]);

  useEffect(() => {
    db.wishes.toArray().then(setWishes);
  }, []);

  const addWish = async (data: { name: string; targetPrice: number }) => {
    const id = crypto.randomUUID();
    const createdAt = Date.now();
    const wish: Wish = {
      id,
      name: data.name,
      targetPrice: data.targetPrice,
      currentBalance: 0,
      status: 'building',
      createdAt,
    };
    await db.wishes.add(wish);
    const all = await db.wishes.toArray();
    setWishes(all);
    syncRecord('wishes', wish).catch(() => {});
  };

  const depositToWish = async (wishId: string, amount: number) => {
    const wish = await db.wishes.get(wishId);
    if (!wish) return;
    const newBalance = wish.currentBalance + amount;
    const newStatus = newBalance >= wish.targetPrice ? 'achieved' : 'building';
    const updates = {
      currentBalance: newBalance,
      status: newStatus as 'building' | 'achieved' | 'withdrawn',
      achievedAt: newStatus === 'achieved' ? Date.now() : undefined,
    };
    await db.wishes.update(wishId, updates);
    const all = await db.wishes.toArray();
    setWishes(all);
    syncRecord('wishes', { ...wish, ...updates }).catch(() => {});
  };

  const withdrawFromWish = async (wishId: string, amount: number) => {
    const wish = await db.wishes.get(wishId);
    if (!wish) return;
    const updates = {
      currentBalance: Math.max(0, wish.currentBalance - amount),
      status: 'withdrawn' as const,
    };
    await db.wishes.update(wishId, updates);
    const all = await db.wishes.toArray();
    setWishes(all);
    syncRecord('wishes', { ...wish, ...updates }).catch(() => {});
  };

  const deleteWish = async (wishId: string) => {
    await db.wishes.delete(wishId);
    const all = await db.wishes.toArray();
    setWishes(all);
    deleteRemote('wishes', wishId).catch(() => {});
  };

  const refresh = useCallback(async () => {
    const all = await db.wishes.toArray();
    setWishes(all);
  }, []);

  return { wishes, addWish, depositToWish, withdrawFromWish, deleteWish, refresh };
}
