import { useState, useEffect, useCallback } from 'react';
import { db } from './db';
import type { Tag } from './db';

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);

  const loadTags = useCallback(() => {
    db.tags.orderBy('count').reverse().toArray().then(setTags);
  }, []);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  const addTag = useCallback(async (name: string, color: string) => {
    try {
      const id = crypto.randomUUID();
      const tag = { id, name, color, count: 0, createdAt: Date.now() };
      await db.tags.put(tag); // put 比 add 更可靠（不抛重复键错误）
      await loadTags();
      return id;
    } catch (err) {
      console.error('[useTags] addTag failed:', err);
      throw err;
    }
  }, [loadTags]);

  const updateTag = useCallback(async (id: string, patch: Partial<Tag>) => {
    await db.tags.update(id, patch);
    await loadTags();
  }, [loadTags]);

  const deleteTag = useCallback(async (id: string) => {
    await db.tags.delete(id);
    // 清理所有 transaction 中的该标签引用
    const allTx = await db.transactions.toArray();
    for (const tx of allTx) {
      if (tx.tags && tx.tags.includes(id)) {
        await db.transactions.update(tx.id, {
          tags: tx.tags.filter(t => t !== id),
        });
      }
    }
    await loadTags();
  }, [loadTags]);

  const incrementTagCount = useCallback(async (tagIds: string[]) => {
    for (const tagId of tagIds) {
      const tag = await db.tags.get(tagId);
      if (tag) {
        await db.tags.update(tagId, { count: tag.count + 1 });
      }
    }
    await loadTags();
  }, [loadTags]);

  const refresh = useCallback(() => {
    loadTags();
  }, [loadTags]);

  return { tags, addTag, updateTag, deleteTag, incrementTagCount, refresh };
}
