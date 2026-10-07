import { asNumber } from "@/lib/format";
import { controlApi } from "@/lib/control-api";

// Gateway wire values; monitoring must not require a generated database client.
const BudgetStatus = ["draft", "sent", "viewed", "waiting", "approved", "rejected", "expired"] as const;
type BudgetStatus = typeof BudgetStatus[number];
const SubscriptionStatus = ["trialing", "active", "past_due", "canceled"] as const;
type SubscriptionStatus = typeof SubscriptionStatus[number];

export type SeriesPoint = { label: string; count: number };

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function lastDays(days: number) {
  const today = startOfDay(new Date());
  return Array.from({ length: days }).map((_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - 1 - index));
    return date;
  });
}

function label(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(date);
}

export function bucketByDay(rows: { createdAt: Date }[], days = 7): SeriesPoint[] {
  const dates = lastDays(days);
  const buckets = new Map(dates.map((date) => [startOfDay(date).toISOString(), 0]));
  for (const row of rows) {
    const key = startOfDay(row.createdAt).toISOString();
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  return dates.map((date) => ({ label: label(date), count: buckets.get(startOfDay(date).toISOString()) ?? 0 }));
}

type DashboardPayload = {
  companyCount: number;
  userCount: number;
  budgetCount: number;
  subscriptions: { status: SubscriptionStatus; _count: { _all: number } }[];
  recentUsers: { createdAt: string }[];
  recentCompanies: { createdAt: string }[];
  budgetsByStatus: { status: BudgetStatus; _count: { _all: number } }[];
  budgetTotals: { _sum: { total: unknown } };
  approved: { _sum: { total: unknown } };
};

export async function getDashboardMetrics() {
  const data = await controlApi<DashboardPayload>("dashboard");

  const subscriptionSummary = Object.fromEntries(
    SubscriptionStatus.map((status) => [status, 0]),
  ) as Record<SubscriptionStatus, number>;
  for (const row of data.subscriptions) subscriptionSummary[row.status] = row._count._all;

  const budgetSummary = Object.fromEntries(
    BudgetStatus.map((status) => [status, 0]),
  ) as Record<BudgetStatus, number>;
  for (const row of data.budgetsByStatus) budgetSummary[row.status] = row._count._all;

  const recentUsers = data.recentUsers.map((row) => ({ createdAt: new Date(row.createdAt) }));
  const recentCompanies = data.recentCompanies.map((row) => ({ createdAt: new Date(row.createdAt) }));

  return {
    companyCount: data.companyCount,
    userCount: data.userCount,
    budgetCount: data.budgetCount,
    subscriptionCount: data.subscriptions.reduce((sum, row) => sum + row._count._all, 0),
    subscriptionSummary,
    budgetSummary,
    users7: bucketByDay(recentUsers, 7),
    users30: bucketByDay(recentUsers, 30),
    companies30: bucketByDay(recentCompanies, 30),
    totalBudgeted: asNumber(data.budgetTotals._sum.total),
    totalApproved: asNumber(data.approved._sum.total),
  };
}
