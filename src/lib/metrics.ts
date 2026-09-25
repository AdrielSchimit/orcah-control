import { BudgetStatus, SubscriptionStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { asNumber } from "@/lib/format";

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

export async function getDashboardMetrics() {
  const since30 = new Date();
  since30.setDate(since30.getDate() - 29);

  const [
    companyCount,
    userCount,
    budgetCount,
    subscriptions,
    recentUsers,
    recentCompanies,
    budgetsByStatus,
    budgetTotals,
  ] = await Promise.all([
    prisma.company.count(),
    prisma.user.count(),
    prisma.budget.count(),
    prisma.subscription.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.user.findMany({ where: { createdAt: { gte: since30 } }, select: { createdAt: true } }),
    prisma.company.findMany({ where: { createdAt: { gte: since30 } }, select: { createdAt: true } }),
    prisma.budget.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.budget.aggregate({ _sum: { total: true } }),
  ]);

  const approved = await prisma.budget.aggregate({
    where: { status: "approved" },
    _sum: { total: true },
  });

  const subscriptionSummary = Object.fromEntries(
    Object.values(SubscriptionStatus).map((status) => [status, 0]),
  ) as Record<SubscriptionStatus, number>;
  for (const row of subscriptions) subscriptionSummary[row.status] = row._count._all;

  const budgetSummary = Object.fromEntries(
    Object.values(BudgetStatus).map((status) => [status, 0]),
  ) as Record<BudgetStatus, number>;
  for (const row of budgetsByStatus) budgetSummary[row.status] = row._count._all;

  return {
    companyCount,
    userCount,
    budgetCount,
    subscriptionCount: subscriptions.reduce((sum, row) => sum + row._count._all, 0),
    subscriptionSummary,
    budgetSummary,
    users7: bucketByDay(recentUsers, 7),
    users30: bucketByDay(recentUsers, 30),
    companies30: bucketByDay(recentCompanies, 30),
    totalBudgeted: asNumber(budgetTotals._sum.total),
    totalApproved: asNumber(approved._sum.total),
  };
}
