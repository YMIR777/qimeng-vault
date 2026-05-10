export interface Transaction {
  type: 'income' | 'expense';
  amount: number;
  date: number;
  category?: string;
  platform?: string;
  timeSpent?: number;
}

export function calcNetWorth(transactions: Transaction[]): number {
  return transactions.reduce((sum, t) => {
    return t.type === 'income' ? sum + t.amount : sum - t.amount;
  }, 0);
}

export function calcMonthlyStats(transactions: Transaction[], monthStr?: string) {
  const now = new Date();
  const targetMonth = monthStr || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [year, month] = targetMonth.split('-').map(Number);
  const start = new Date(year, month - 1, 1).getTime();
  const end = new Date(year, month, 1).getTime();
  
  const monthTx = transactions.filter(t => t.date >= start && t.date < end);
  const income = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  
  return { income, expense, net: income - expense, savingsRate: income > 0 ? ((income - expense) / income) * 100 : 0 };
}

export function calcSavingsRate(transactions: Transaction[], period: 'current' | string = 'current'): number {
  const stats = calcMonthlyStats(transactions, period === 'current' ? undefined : period);
  return Math.max(0, stats.savingsRate);
}

export function calcAvgMonthlyExpense(transactions: Transaction[]): number {
  if (transactions.length === 0) return 0;
  const expenses = transactions.filter(t => t.type === 'expense');
  if (expenses.length === 0) return 0;
  
  const dates = transactions.map(t => t.date);
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  const monthsDiff = Math.max(1, Math.ceil((maxDate - minDate) / (30 * 24 * 60 * 60 * 1000)));
  
  const totalExpense = expenses.reduce((s, t) => s + t.amount, 0);
  return totalExpense / monthsDiff;
}

export function calcEmergencyFundMonths(transactions: Transaction[]): number {
  const netWorth = calcNetWorth(transactions);
  const avgExpense = calcAvgMonthlyExpense(transactions);
  if (avgExpense === 0) return 0;
  return netWorth / avgExpense;
}

export function calcHourlyRate(transactions: Transaction[]): number {
  const incomeWithTime = transactions.filter(t => t.type === 'income' && t.timeSpent && t.timeSpent > 0);
  if (incomeWithTime.length === 0) return 0;
  
  const totalIncome = incomeWithTime.reduce((s, t) => s + t.amount, 0);
  const totalMinutes = incomeWithTime.reduce((s, t) => s + (t.timeSpent ?? 0), 0);
  
  if (totalMinutes === 0) return 0;
  return Math.round(totalIncome / (totalMinutes / 60));
}

export function calcTimeCost(amount: number, hourlyRate: number): number {
  if (hourlyRate <= 0) return 0;
  return (amount / hourlyRate) * 60; // returns minutes
}

export function calcFreedomProgress(transactions: Transaction[], targetMonths: number = 6): number {
  const emergencyMonths = calcEmergencyFundMonths(transactions);
  if (targetMonths <= 0) return 0;
  return Math.min(100, (emergencyMonths / targetMonths) * 100);
}

export function calcNetWorthHistory(transactions: Transaction[]) {
  if (transactions.length === 0) return [];
  
  const sorted = [...transactions].sort((a, b) => a.date - b.date);
  const history: { date: string; netWorth: number }[] = [];
  let runningTotal = 0;
  
  // Group by month
  const monthly: Record<string, Transaction[]> = {};
  for (const tx of sorted) {
    const d = new Date(tx.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!monthly[key]) monthly[key] = [];
    monthly[key].push(tx);
  }
  
  for (const [month, txs] of Object.entries(monthly)) {
    const monthNet = txs.reduce((s, t) => t.type === 'income' ? s + t.amount : s - t.amount, 0);
    runningTotal += monthNet;
    history.push({ date: month, netWorth: runningTotal });
  }
  
  return history;
}
