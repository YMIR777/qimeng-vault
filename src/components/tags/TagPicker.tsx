import { useState, useEffect } from 'react';
import { db } from '../../store/db';
import type { Tag } from '../../store/db';

const TAG_COLORS = ['#c9923a', '#6b9fcf', '#7a9e7e', '#d4a0a0', '#9b8fcf', '#cf9b6b', '#6bcfbc', '#cf6b9b'];

interface TagPickerProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function TagPicker({ selectedIds, onChange }: TagPickerProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState('');

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

  function handleAddTag() {
    const name = newTagName.trim();
    if (!name) return;
    const color = TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
    const id = crypto.randomUUID();
    db.tags.add({ id, name, color, count: 0, createdAt: Date.now() }).then(() => {
      db.tags.orderBy('count').reverse().limit(20).toArray().then(setTags);
      onChange([...selectedIds, id]);
    });
    setNewTagName('');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* 标签列表 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {tags.map(tag => {
          const selected = selectedIds.includes(tag.id);
          return (
            <button
              key={tag.id}
              onClick={() => toggle(tag.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '6px',
                border: `1.5px solid ${selected ? tag.color : '#ddd6ca'}`,
                background: selected ? `${tag.color}18` : '#faf7f2',
                color: selected ? tag.color : '#7a7269',
                fontSize: '12px',
                fontFamily: "'Noto Sans SC', sans-serif",
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {/* 颜色圆点 */}
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: tag.color,
                flexShrink: 0,
              }} />
              {tag.name}
            </button>
          );
        })}
      </div>

      {/* 新建标签输入框 */}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <input
          type="text"
          value={newTagName}
          onChange={e => setNewTagName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleAddTag(); }}
          placeholder="输入新标签名后回车创建"
          style={{
            flex: 1,
            padding: '6px 10px',
            borderRadius: '8px',
            border: '1px solid #ddd6ca',
            background: '#faf7f2',
            color: '#3d3427',
            fontSize: '12px',
            fontFamily: "'Noto Sans SC', sans-serif",
            outline: 'none',
          }}
        />
        <button
          onClick={handleAddTag}
          disabled={!newTagName.trim()}
          style={{
            padding: '6px 12px',
            borderRadius: '8px',
            border: 'none',
            background: '#c9923a',
            color: '#fff',
            fontSize: '12px',
            fontFamily: "'Noto Sans SC', sans-serif",
            cursor: 'pointer',
            opacity: newTagName.trim() ? 1 : 0.5,
          }}
        >
          + 新建
        </button>
      </div>
    </div>
  );
}