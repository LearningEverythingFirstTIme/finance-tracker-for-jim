import { 
  getMonthlySummary, 
  getCategoryBreakdown, 
  getMonthlyData,
  type MonthlyData,
  type CategoryData 
} from './transactions';
import { getUpcomingBills, getOverdueBills } from './bills';

export interface DashboardSummary {
  income: number;
  expense: number;
  balance: number;
  savingsRate: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  recentTransactions: Awaited<ReturnType<typeof import('./transactions').getTransactions>>;
  upcomingBills: Awaited<ReturnType<typeof getUpcomingBills>>;
  categoryBreakdown: CategoryData[];
  monthlyData: MonthlyData[];
}

export async function getDashboardData(): Promise<{
  summary: DashboardSummary;
  upcomingBills: Awaited<ReturnType<typeof getUpcomingBills>>;
  categoryBreakdown: CategoryData[];
  monthlyData: MonthlyData[];
}> {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  const startOfYear = `${currentYear}-01-01`;
  const endOfYear = `${currentYear}-12-31`;

  const [
    monthlySummary,
    upcomingBills,
    categoryBreakdown,
    monthlyData,
  ] = await Promise.all([
    getMonthlySummary(currentMonth),
    getUpcomingBills(5),
    getCategoryBreakdown(startOfYear, endOfYear),
    getMonthlyData(currentYear),
  ]);

  const savingsRate = monthlySummary.income > 0 
    ? ((monthlySummary.income - monthlySummary.expense) / monthlySummary.income) * 100 
    : 0;

  return {
    summary: {
      income: monthlySummary.income,
      expense: monthlySummary.expense,
      balance: monthlySummary.balance,
      savingsRate,
    },
    upcomingBills,
    categoryBreakdown,
    monthlyData,
  };
}

export { getMonthlySummary, getCategoryBreakdown, getMonthlyData, getUpcomingBills, getOverdueBills };
export type { MonthlyData, CategoryData };
