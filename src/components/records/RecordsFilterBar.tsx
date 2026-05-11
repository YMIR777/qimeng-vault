import { useState } from 'react';
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

  // Derive available categories based on selected type
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
                if (opt.value === 'custom') {
                  setShowCustom(true);
                } else {
                  setShowCustom(false);
                }
              }}
              style={{
                padding: '5px 12px',
                borderRadius: '8px',
                border: selected ? '1.5px solid #c9923a' : '1.5px solid transparent',
                background: selected ? 'rgba(201,146,58,0.12)' : 'rgba(0,0,0,0.04)',
                color: selected ? '#c9923a' : '#7a7269',
                fontSize: '12px',
                fontFamily: "'Noto Sans SC', sans-serif",
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              {opt.label}
              {opt.value === 'custom' && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="1" y="2" width="10" height="9" rx="1.5"/>
                  <path d="M1 5h10M4 1v2M8 1v2"/>
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom date range inputs */}
      {showCustom && (
        <div
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            padding: '4px 0',
          }}
        >
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
            }}
          >
            应用
          </button>
        </div>
      )}

      {/* Row 2: Type, Category, Tag selects */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Type select */}
        <select
          value={filterState.type}
          onChange={e => {
            setType(e.target.value as TxType);
            setCategory('全部');
          }}
          style={{
            padding: '6px 10px',
            borderRadius: '8px',
            border: '1px solid #d8d0c4',
            background: '#faf7f2',
            color: '#3d3427',
            fontSize: '12px',
            fontFamily: "'Noto Sans SC', sans-serif",
            outline: 'none',
            cursor: 'pointer',
            minWidth: '72px',
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
            borderRadius: '8px',
            border: '1px solid #d8d0c4',
            background: '#faf7f2',
            color: '#3d3427',
            fontSize: '12px',
            fontFamily: "'Noto Sans SC', sans-serif",
            outline: 'none',
            cursor: 'pointer',
            minWidth: '80px',
          }}
        >
          <option value="全部">全部分类</option>
          {availableCategories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Tag multi-select */}
        <select
          multiple
          value={filterState.tagIds}
          onChange={e => {
            const selected = Array.from(e.target.selectedOptions).map(o => o.value);
            setTagIds(selected);
          }}
          style={{
            padding: '6px 10px',
            borderRadius: '8px',
            border: '1px solid #d8d0c4',
            background: '#faf7f2',
            color: '#3d3427',
            fontSize: '12px',
            fontFamily: "'Noto Sans SC', sans-serif",
            outline: 'none',
            cursor: 'pointer',
            minWidth: '100px',
            maxHeight: '80px',
          }}
        >
          <option value="__all__">全部标签</option>
          {allTags.map(tag => (
            <option key={tag.id} value={tag.id}>{tag.name}</option>
          ))}
        </select>
      </div>

      {/* Row 3: Sort */}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: '#b8af9e', letterSpacing: '0.1em' }}>排序</span>
        <select
          value={filterState.sort}
          onChange={e => setSort(e.target.value as SortOrder)}
          style={{
            padding: '5px 10px',
            borderRadius: '8px',
            border: '1px solid #d8d0c4',
            background: '#faf7f2',
            color: '#3d3427',
            fontSize: '12px',
            fontFamily: "'Noto Sans SC', sans-serif",
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}