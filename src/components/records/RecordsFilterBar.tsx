import { useState, useRef, useEffect } from 'react';
import type { Tag } from '../../store/db';

export type TimeRange = 'all' | 'today' | 'week' | 'month' | 'custom';
export type SortOrder = 'newest' | 'oldest' | 'amountDesc' | 'amountAsc';
export type TxType = 'all' | 'income' | 'expense';

export interface RecordsFilterState {
  timeRange: TimeRange;
  customStart?: string;
  customEnd?: string;
  type: TxType;
  category: string;
  tagIds: string[];
  sort: SortOrder;
}

const TIME_OPTIONS: { label: string; value: TimeRange }[] = [
  { label: '全部', value: 'all' },
  { label: '今日', value: 'today' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '自定义', value: 'custom' },
];

const SORT_OPTIONS: { label: string; value: SortOrder }[] = [
  { label: '最新', value: 'newest' },
  { label: '最旧', value: 'oldest' },
  { label: '金额高', value: 'amountDesc' },
  { label: '金额低', value: 'amountAsc' },
];

const TYPE_OPTIONS: { label: string; value: TxType }[] = [
  { label: '全部', value: 'all' },
  { label: '收入', value: 'income' },
  { label: '支出', value: 'expense' },
];

const EXPENSE_CATEGORIES = ['交通', '餐饮', '娱乐', '购物', '住房', '医疗', '通讯', '其他'];
const INCOME_CATEGORIES = ['陪玩', '兼职', '礼物', '退款', '其他'];

interface RecordsFilterBarProps {
  filterState: RecordsFilterState;
  setTimeRange: (v: TimeRange) => void;
  setCustomDateRange: (start: string, end: string) => void;
  setType: (v: TxType) => void;
  setCategory: (v: string) => void;
  setTagIds: (v: string[]) => void;
  setSort: (v: SortOrder) => void;
  allTags: Tag[];
}

// ─── TagSelector (popover multi-select with pill UI) ───────────────────────────
interface TagSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  allTags: Tag[];
}

function TagSelector({ selectedIds, onChange, allTags }: TagSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  const toggleTag = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(t => t !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const clearAll = () => onChange([]);
  const selectAll = () => onChange(allTags.map(t => t.id));

  const isAllSelected = selectedIds.length === 0 || selectedIds.length === allTags.length;

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Trigger pill */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          padding: '6px 10px',
          borderRadius: '20px',
          border: '1.5px solid',
          borderColor: selectedIds.length > 0 ? '#c9923a' : '#d8d0c4',
          background: selectedIds.length > 0 ? 'rgba(201,146,58,0.10)' : '#faf7f2',
          color: selectedIds.length > 0 ? '#c9923a' : '#7a7269',
          fontSize: '12px',
          fontFamily: "'Noto Sans SC', sans-serif",
          cursor: 'pointer',
          transition: 'all 0.18s ease',
          whiteSpace: 'nowrap',
        }}
      >
        {/* Tag icon */}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M1 1h4.5l5.5 5.5-4.5 4.5L1 6V1z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <circle cx="3.5" cy="3.5" r="0.7" fill="currentColor" />
        </svg>

        <span style={{ fontWeight: selectedIds.length > 0 ? 600 : 400 }}>
          {isAllSelected
            ? '全部标签'
            : selectedIds.length === 1
            ? allTags.find(t => t.id === selectedIds[0])?.name ?? '标签'
            : `${selectedIds.length} 个标签`}
        </span>

        {/* Dropdown chevron */}
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          style={{
            transition: 'transform 0.2s ease',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <path d="M2 3.5l3 3 3-3" />
        </svg>
      </button>

      {/* Dropdown popover */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            zIndex: 200,
            minWidth: '180px',
            background: '#fffdf9',
            borderRadius: '12px',
            border: '1px solid #e8e0d4',
            boxShadow: '0 4px 20px rgba(60,48,32,0.12)',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          {/* Header row: select all / clear */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              paddingBottom: '6px',
              marginBottom: '4px',
              borderBottom: '1px solid #f0ebe2',
            }}
          >
            <button
              onClick={selectAll}
              style={{
                flex: 1,
                padding: '5px 0',
                borderRadius: '6px',
                border: '1px solid #e0d8ca',
                background: '#faf7f2',
                color: '#7a7269',
                fontSize: '11px',
                fontFamily: "'Noto Sans SC', sans-serif",
                cursor: 'pointer',
              }}
            >
              全选
            </button>
            <button
              onClick={clearAll}
              style={{
                flex: 1,
                padding: '5px 0',
                borderRadius: '6px',
                border: '1px solid #e0d8ca',
                background: '#faf7f2',
                color: '#7a7269',
                fontSize: '11px',
                fontFamily: "'Noto Sans SC', sans-serif",
                cursor: 'pointer',
              }}
            >
              清空
            </button>
          </div>

          {/* Tag list */}
          {allTags.length === 0 ? (
            <div
              style={{
                padding: '12px 8px',
                color: '#b8af9e',
                fontSize: '12px',
                textAlign: 'center',
                fontFamily: "'Noto Sans SC', sans-serif",
              }}
            >
              暂无标签
            </div>
          ) : (
            allTags.map(tag => {
              const isExplicitlyChecked = selectedIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '7px 8px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isExplicitlyChecked ? 'rgba(201,146,58,0.10)' : 'transparent',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    if (!isExplicitlyChecked) (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.03)';
                  }}
                  onMouseLeave={e => {
                    if (!isExplicitlyChecked) (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                >
                  {/* Custom checkbox */}
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '4px',
                      border: '1.5px solid',
                      borderColor: isExplicitlyChecked ? '#c9923a' : '#d0c8b8',
                      background: isExplicitlyChecked ? '#c9923a' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {isExplicitlyChecked && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  {/* Color dot */}
                  {tag.color && (
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: tag.color,
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <span
                    style={{
                      fontSize: '13px',
                      color: isExplicitlyChecked ? '#3d3427' : '#7a7269',
                      fontFamily: "'Noto Sans SC', sans-serif",
                      fontWeight: isExplicitlyChecked ? 500 : 400,
                    }}
                  >
                    {tag.name}
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Filter Bar ───────────────────────────────────────────────────────────
export function RecordsFilterBar({
  filterState,
  setTimeRange,
  setCustomDateRange,
  setType,
  setCategory,
  setTagIds,
  setSort,
  allTags,
}: RecordsFilterBarProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [localStart, setLocalStart] = useState(filterState.customStart || '');
  const [localEnd, setLocalEnd] = useState(filterState.customEnd || '');

  const availableCategories =
    filterState.type === 'expense' || filterState.type === 'all'
      ? EXPENSE_CATEGORIES
      : filterState.type === 'income'
      ? INCOME_CATEGORIES
      : [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

  function applyCustomRange() {
    setCustomDateRange(localStart, localEnd);
  }

  return (
    <div
      style={{
        background: '#f5f0e8',
        borderRadius: '12px',
        padding: '12px',
        marginBottom: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      {/* Row 1: Time range buttons */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
        {TIME_OPTIONS.map(opt => {
          const selected = filterState.timeRange === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => {
                setTimeRange(opt.value);
                if (opt.value === 'custom') setShowCustom(true);
                else setShowCustom(false);
              }}
              style={{
                padding: '5px 12px',
                borderRadius: '20px',
                border: '1.5px solid',
                borderColor: selected ? '#c9923a' : 'transparent',
                background: selected ? 'rgba(201,146,58,0.12)' : 'rgba(0,0,0,0.04)',
                color: selected ? '#c9923a' : '#7a7269',
                fontSize: '12px',
                fontFamily: "'Noto Sans SC', sans-serif",
                fontWeight: selected ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              {opt.label}
              {opt.value === 'custom' && (
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="1" y="2" width="10" height="9" rx="1.5" />
                  <path d="M1 5h10M4 1v2M8 1v2" />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom date range inputs */}
      {showCustom && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '4px 0' }}>
          <input
            type="date"
            value={localStart}
            onChange={e => setLocalStart(e.target.value)}
            style={{
              flex: 1,
              padding: '6px 10px',
              borderRadius: '8px',
              border: '1px solid #d8d0c4',
              background: '#faf7f2',
              color: '#3d3427',
              fontSize: '12px',
              fontFamily: "'Noto Sans SC', sans-serif",
              outline: 'none',
            }}
          />
          <span style={{ color: '#b8af9e', fontSize: '12px' }}>至</span>
          <input
            type="date"
            value={localEnd}
            onChange={e => setLocalEnd(e.target.value)}
            style={{
              flex: 1,
              padding: '6px 10px',
              borderRadius: '8px',
              border: '1px solid #d8d0c4',
              background: '#faf7f2',
              color: '#3d3427',
              fontSize: '12px',
              fontFamily: "'Noto Sans SC', sans-serif",
              outline: 'none',
            }}
          />
          <button
            onClick={applyCustomRange}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              background: '#c9923a',
              color: '#fff',
              fontSize: '12px',
              fontFamily: "'Noto Sans SC', sans-serif",
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            应用
          </button>
        </div>
      )}

      {/* Row 2: Type, Category, Tag selectors */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Type select */}
        <select
          value={filterState.type}
          onChange={e => { setType(e.target.value as TxType); setCategory('全部'); }}
          style={{
            padding: '6px 10px',
            borderRadius: '20px',
            border: '1.5px solid #d8d0c4',
            background: '#faf7f2',
            color: '#3d3427',
            fontSize: '12px',
            fontFamily: "'Noto Sans SC', sans-serif",
            outline: 'none',
            cursor: 'pointer',
            fontWeight: 400,
            appearance: 'none',
            paddingRight: '22px',
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='10' viewBox='0 0 10 10' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2 3.5l3 3 3-3' stroke='%237a7269' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 8px center',
          }}
        >
          {TYPE_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Category select */}
        <select
          value={filterState.category}
          onChange={e => setCategory(e.target.value)}
          style={{
            padding: '6px 10px',
            borderRadius: '20px',
            border: '1.5px solid #d8d0c4',
            background: '#faf7f2',
            color: '#3d3427',
            fontSize: '12px',
            fontFamily: "'Noto Sans SC', sans-serif",
            outline: 'none',
            cursor: 'pointer',
            fontWeight: 400,
            appearance: 'none',
            paddingRight: '22px',
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='10' viewBox='0 0 10 10' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2 3.5l3 3 3-3' stroke='%237a7269' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 8px center',
          }}
        >
          <option value="全部">全部分类</option>
          {availableCategories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Tag selector — replaces the ugly native multi-select */}
        <TagSelector
          selectedIds={filterState.tagIds}
          onChange={setTagIds}
          allTags={allTags}
        />
      </div>

      {/* Row 3: Sort */}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <span
          style={{
            fontSize: '11px',
            color: '#b8af9e',
            letterSpacing: '0.08em',
            fontFamily: "'Noto Sans SC', sans-serif",
          }}
        >
          排序
        </span>
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
          <select
            value={filterState.sort}
            onChange={e => setSort(e.target.value as SortOrder)}
            style={{
              padding: '5px 26px 5px 10px',
              borderRadius: '20px',
              border: '1.5px solid #d8d0c4',
              background: '#faf7f2',
              color: '#3d3427',
              fontSize: '12px',
              fontFamily: "'Noto Sans SC', sans-serif",
              outline: 'none',
              cursor: 'pointer',
              fontWeight: 400,
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='10' viewBox='0 0 10 10' fill='none' xmlns='http://www.w3.org/2000/svg%3E%3Cpath d='M2 3.5l3 3 3-3' stroke='%237a7269' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 8px center',
            }}
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}