import { useState, useEffect } from 'react';
import { db } from './db';
import type { Tag } from './db';

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    db.tags.orderBy('count').reverse().toArray().then(setTags);
  }, []);

  return { tags };
}