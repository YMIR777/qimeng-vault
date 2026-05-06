export interface ParseResult {
  type: 'income' | 'expense' | null;
  platform?: string;
  category?: string;
  amount: number;
  bossName?: string;
  judgment?: 'worthy' | 'unworthy';
  timeSpent?: number;
  note?: string;
  complete: boolean;
  missingFields: string[];
}

const PLATFORMS = ['比心', '微信', '抖音', '小红书', '建行', '招行'];

// 收入关键词：收到钱的方向性动作
const INCOME_KEYWORDS = ['收到', '到账', '存了', '给了', '比心', '陪玩', '转账', '工资', '退款', '报销'];

// 支出关键词：花钱的方向性动作（注意：不包含"块/元/钱"——那只是金额单位！）
const EXPENSE_KEYWORDS = ['花了', '支出', '买', '消费', '转出', '付了', '支付', '缴费', '外卖', '打车'];

const BOSS_KEYWORDS = ['老板', '甲', '乙', '丙', '丁'];
const TIME_KEYWORDS_HOUR = ['h', '小时', 'hours', 'hour'];
const TIME_KEYWORDS_MIN = ['分钟', 'min', 'mins'];

const EXPENSE_CATEGORIES: Record<string, string> = {
  '打车': '交通', '地铁': '交通', '公交': '交通', '油费': '交通', '停车': '交通',
  '吃饭': '餐饮', '外卖': '餐饮', '零食': '餐饮', '咖啡': '餐饮', '黄焖鸡': '餐饮',
  '奶茶': '餐饮', '餐厅': '餐饮', '饭': '餐饮', '面': '餐饮', '饺子': '餐饮',
  '游戏': '娱乐', '电影': '娱乐', '音乐': '娱乐', '演出': '娱乐',
  '衣服': '购物', '电子产品': '购物', '日用品': '购物',
  '房租': '住房', '水电': '住房', '物业': '住房',
  '买药': '医疗', '门诊': '医疗',
  '话费': '通讯', '网络': '通讯',
};

function extractMaxNumber(text: string): number {
  const nums = text.match(/\d+/g);
  if (!nums || nums.length === 0) return 0;
  return Math.max(...nums.map(n => parseInt(n, 10)));
}

function extractBossName(text: string): string | undefined {
  for (const kw of BOSS_KEYWORDS) {
    const idx = text.indexOf(kw);
    if (idx !== -1 && idx + kw.length < text.length) {
      const after = text.slice(idx + kw.length).trim();
      const match = after.match(/^([^\s\d]+)/);
      if (match) return match[1];
    }
  }
  return undefined;
}

function extractTimeSpent(text: string): number | undefined {
  for (const kw of TIME_KEYWORDS_HOUR) {
    if (text.includes(kw)) {
      const idx = text.indexOf(kw);
      const before = text.slice(0, idx);
      const num = before.match(/\d+$/);
      if (num) return parseInt(num[0], 10) * 60;
    }
  }
  for (const kw of TIME_KEYWORDS_MIN) {
    if (text.includes(kw)) {
      const idx = text.indexOf(kw);
      const before = text.slice(0, idx);
      const num = before.match(/\d+$/);
      if (num) return parseInt(num[0], 10);
    }
  }
  return undefined;
}

function detectPlatform(text: string): string | undefined {
  for (const p of PLATFORMS) {
    if (text.includes(p)) return p;
  }
  return undefined;
}

function detectCategory(text: string): string {
  for (const [keyword, category] of Object.entries(EXPENSE_CATEGORIES)) {
    if (text.includes(keyword)) return category;
  }
  return '其他';
}

function detectDirection(text: string): { type: 'income' | 'expense' | null; confidence: number } {
  // 1. 收入强信号
  for (const kw of INCOME_KEYWORDS) {
    if (text.includes(kw)) return { type: 'income', confidence: 0.9 };
  }
  
  // 2. 支出强信号
  for (const kw of EXPENSE_KEYWORDS) {
    if (text.includes(kw)) return { type: 'expense', confidence: 0.9 };
  }
  
  // 3. 消费分类词 → 支出
  for (const kw of Object.keys(EXPENSE_CATEGORIES)) {
    if (text.includes(kw)) return { type: 'expense', confidence: 0.7 };
  }
  
  // 4. 平台关键词 → 收入（陪玩收入通常带平台名）
  const hasPlatform = detectPlatform(text);
  if (hasPlatform) return { type: 'income', confidence: 0.6 };
  
  // 5. 无法判断
  return { type: null, confidence: 0 };
}

export function parseInput(input: string): ParseResult {
  const amount = extractMaxNumber(input);
  if (amount === 0) {
    return { type: null, amount: 0, complete: false, missingFields: ['amount'] };
  }

  const { type } = detectDirection(input);
  const platform = detectPlatform(input);
  const bossName = extractBossName(input);
  const timeSpent = extractTimeSpent(input);

  if (type === 'income') {
    const missingFields: string[] = [];
    if (!platform) missingFields.push('platform');
    const complete = !!platform;
    return { 
      type, 
      platform, 
      amount, 
      bossName, 
      timeSpent, 
      note: input,  // 日记式完整记录
      complete, 
      missingFields 
    };
  }

  if (type === 'expense') {
    const category = detectCategory(input);
    return { 
      type, 
      category, 
      amount, 
      timeSpent, 
      note: input,  // 日记式完整记录
      complete: true, 
      missingFields: [] 
    };
  }

  // 无法判断方向 → 标记为 incomplete，让用户在 SupplementForm 里选
  return { 
    type: null, 
    amount, 
    complete: false, 
    missingFields: ['type'],
    note: input
  };
}
