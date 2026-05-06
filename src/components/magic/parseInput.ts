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
const EXPENSE_KEYWORDS = ['花了', '支出', '买', '消费', '转出', '块', '元', '钱'];
const INCOME_KEYWORDS = ['转', '收到', '收入', '到账', '比心', '陪玩'];
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

export function parseInput(input: string): ParseResult {
  const amount = extractMaxNumber(input);
  if (amount === 0) {
    return { type: null, amount: 0, complete: false, missingFields: ['amount'] };
  }

  const hasIncomeKeyword = INCOME_KEYWORDS.some(k => input.includes(k));
  const hasExpenseKeyword = EXPENSE_KEYWORDS.some(k => input.includes(k));
  const hasPlatform = detectPlatform(input);
  
  let type: 'income' | 'expense' | null = null;
  if (hasIncomeKeyword && hasPlatform) type = 'income';
  else if (hasExpenseKeyword) type = 'expense';
  else if (hasPlatform) type = 'income';
  else {
    // 没有明确关键词时，如果有消费分类词 → expense，否则默认 expense（日常随手记大多是支出）
    const hasExpenseCategory = Object.keys(EXPENSE_CATEGORIES).some(k => input.includes(k));
    type = hasExpenseCategory ? 'expense' : 'income';
  }

  // Extract description: the Chinese text before the amount number
  const description = extractDescription(input, amount);

  const platform = detectPlatform(input);
  const bossName = extractBossName(input);
  const timeSpent = extractTimeSpent(input);

  if (type === 'income') {
    const missingFields: string[] = [];
    if (!platform) missingFields.push('platform');
    const complete = !!platform;
    return { type, platform, amount, bossName, timeSpent, note: description || input, complete, missingFields };
  }

  if (type === 'expense') {
    const category = detectCategory(input);
    return { type, category, amount, timeSpent, note: description || input, complete: true, missingFields: [] };
  }

  return { type: null, amount, complete: false, missingFields: ['type'] };
}

function extractDescription(input: string, amount: number): string | undefined {
  // Find the first number in the string
  const numStr = amount.toString();
  const numIndex = input.indexOf(numStr);
  if (numIndex === -1) return undefined;
  
  // Take the text before the number, clean it up
  const beforeNum = input.slice(0, numIndex).trim();
  // Remove common trailing words like "花了"/"支出"/"收入" etc.
  const cleanDesc = beforeNum.replace(/(花了|支出|收入|到账|收到|转|买|消费|转出)$/g, '').trim();
  return cleanDesc || undefined;
}
