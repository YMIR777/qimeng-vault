import { useState, useEffect } from 'react';
import { db } from '../../store/db';
import type { Tag } from '../../store/db';

interface TagPickerProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function TagPicker({ selectedIds, onChange }: TagPickerProps) {
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    db.tags.orderBy('count').reverse().limit(20).toArray().then(setTags);
  }, []);

  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(t => t !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {tags.map(tag => {
        const selected = selectedIds.includes(tag.id);
        return (
          <button
            key={tag.id}
            onClick={() => toggle(tag.id)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: `1.5px solid ${selected ? tag.color : 'var(--border-subtle)'}`,
              background: selected ? `${tag.color}20` : 'transparent',
              color: selected ? tag.color : 'var(--text-secondary)',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            {tag.name}
          </button>
        );
      })}
    </div>
  );
}