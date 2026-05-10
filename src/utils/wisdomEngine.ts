// src/utils/wisdomEngine.ts

export enum WisdomLevel {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  WARNING = 'warning',
  DANGER = 'danger',
  BEGINNER = 'beginner',
}

export interface Insight {
  level: WisdomLevel;
  message: string;
  emoji?: string;
  color: string;
  months?: number;
}

const SAVINGS_RATE_INSIGHTS: Record<WisdomLevel, string[]> = {
  [WisdomLevel.EXCELLENT]: [
    "博多·舍费尔会为你骄傲。你的金鹅吃得很饱，未来会回报你。",
    "你在为未来的自己发红包。这种自律，本身就是财富。",
    "纳瓦尔说财富是睡觉时也能赚钱的资产。你的金鹅正在长大。",
  ],
  [WisdomLevel.GOOD]: [
    "金鹅在慢慢长大，继续保持。时间是你的盟友。",
    "好的储蓄习惯比高收入更重要。你在正确的路上。",
  ],
  [WisdomLevel.WARNING]: [
    "你的金鹅有点饿了。试着找到那些'隐形支出'。",
    "收入不是问题，存不下来才是。——《小狗钱钱》",
  ],
  [WisdomLevel.DANGER]: [
    "金鹅正在挨饿。这个月花的比赚的多，它在减肥。",
    "清崎说：穷人先花钱，富人先存钱。是时候改变了。",
  ],
  [WisdomLevel.BEGINNER]: [
    "每个财富故事都从第一块钱开始。",
  ],
};

const EMERGENCY_INSIGHTS: Record<WisdomLevel, string[]> = {
  [WisdomLevel.EXCELLENT]: [
    "你的安全网足够结实。即使明天不工作，也能安心生活。",
  ],
  [WisdomLevel.GOOD]: [
    "应急资金稳步积累。继续这样，自由就在不远处。",
  ],
  [WisdomLevel.WARNING]: [
    "安全网还不够大。建议储备至少 3-6 个月的生活费。",
    "摩根·豪塞尔说：容错空间是最被低估的财务指标。",
  ],
  [WisdomLevel.DANGER]: [
    "危险区。任何意外都可能让你陷入困境。优先建立应急资金。",
  ],
  [WisdomLevel.BEGINNER]: [
    "从零开始不可怕。第一个月的储备，比任何投资都重要。",
  ],
};

const FREEDOM_INSIGHTS: Record<WisdomLevel, string[]> = {
  [WisdomLevel.EXCELLENT]: [
    "你已经跨过了财务自由的第一道门槛。这是大多数人一辈子没到达的地方。",
  ],
  [WisdomLevel.GOOD]: [
    "进度不错。继续喂养金鹅，它在为你工作。",
  ],
  [WisdomLevel.WARNING]: [
    "第一步已经迈出。每一个百分比，都是你为自己赢得的时间。",
  ],
  [WisdomLevel.DANGER]: [
    "还在起点。但起点不是坏事——它是所有故事开始的地方。",
  ],
  [WisdomLevel.BEGINNER]: [
    "0% 只是起点。纳瓦尔说：'财富是拥有时间的自由。'你开始了吗？",
  ],
};

function pickMessage(messages: string[]): string {
  return messages[Math.floor(Math.random() * messages.length)];
}

function getLevelColor(level: WisdomLevel): string {
  const colors: Record<WisdomLevel, string> = {
    [WisdomLevel.EXCELLENT]: '#7a9e7e',
    [WisdomLevel.GOOD]: '#6b9fcf',
    [WisdomLevel.WARNING]: '#c9923a',
    [WisdomLevel.DANGER]: '#d4a0a0',
    [WisdomLevel.BEGINNER]: '#b8af9e',
  };
  return colors[level];
}

export function getSavingsRateInsight(rate: number): Insight {
  let level: WisdomLevel;
  if (rate >= 30) level = WisdomLevel.EXCELLENT;
  else if (rate >= 20) level = WisdomLevel.GOOD;
  else if (rate >= 10) level = WisdomLevel.WARNING;
  else if (rate > 0) level = WisdomLevel.DANGER;
  else level = WisdomLevel.BEGINNER;

  return {
    level,
    message: pickMessage(SAVINGS_RATE_INSIGHTS[level]),
    color: getLevelColor(level),
  };
}

export function getEmergencyFundInsight(months: number): Insight {
  let level: WisdomLevel;
  if (months >= 6) level = WisdomLevel.EXCELLENT;
  else if (months >= 3) level = WisdomLevel.GOOD;
  else if (months >= 1) level = WisdomLevel.WARNING;
  else if (months > 0) level = WisdomLevel.DANGER;
  else level = WisdomLevel.BEGINNER;

  return {
    level,
    message: pickMessage(EMERGENCY_INSIGHTS[level]),
    color: getLevelColor(level),
    months,
  };
}

export function getFreedomProgressInsight(progress: number): Insight {
  let level: WisdomLevel;
  if (progress >= 100) level = WisdomLevel.EXCELLENT;
  else if (progress >= 50) level = WisdomLevel.GOOD;
  else if (progress >= 20) level = WisdomLevel.WARNING;
  else if (progress > 0) level = WisdomLevel.DANGER;
  else level = WisdomLevel.BEGINNER;

  return {
    level,
    message: pickMessage(FREEDOM_INSIGHTS[level]),
    color: getLevelColor(level),
  };
}
