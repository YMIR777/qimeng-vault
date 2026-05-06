import { useState, useEffect } from 'react';
import { db } from './db';
import type { Wish } from './db';

export function useWishes() {
  const [wishes, setWishes] = useState<Wish[]>([]);

  useEffect(() => {
    db.wishes.toArray().then(setWishes);
  }, []);

  const addWish = async (data: { name: string; targetPrice: number }) => {
    const id = crypto.randomUUID();
    await db.wishes.add({
      id,
      name: data.name,
      targetPrice: data.targetPrice,
      currentBalance: 0,
      status: 'building',
      createdAt: Date.now(),
    });
    const all = await db.wishes.toArray();
    setWishes(all);
  };

  const depositToWish = async (wishId: string, amount: number) => {
    const wish = await db.wishes.get(wishId);
    if (!wish) return;
    const newBalance = wish.currentBalance + amount;
    const newStatus = newBalance >= wish.targetPrice ? 'achieved' : 'building';
    await db.wishes.update(wishId, {
      currentBalance: newBalance,
      status: newStatus,
      achievedAt: newStatus === 'achieved' ? Date.now() : undefined,
    });
    const all = await db.wishes.toArray();
    setWishes(all);
  };

  const withdrawFromWish = async (wishId: string, amount: number) => {
    const wish = await db.wishes.get(wishId);
    if (!wish) return;
    await db.wishes.update(wishId, {
      currentBalance: Math.max(0, wish.currentBalance - amount),
      status: 'withdrawn',
    });
    const all = await db.wishes.toArray();
    setWishes(all);
  };

  const deleteWish = async (wishId: string) => {
    await db.wishes.delete(wishId);
    const all = await db.wishes.toArray();
    setWishes(all);
  };

  return { wishes, addWish, depositToWish, withdrawFromWish, deleteWish };
}
