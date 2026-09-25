import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export async function listCompanies(query = "", status = "") {
  const where: Prisma.CompanyWhereInput = {};
  const search = query.trim();
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { whatsapp: { contains: search } },
      { user: { email: { contains: search, mode: "insensitive" } } },
    ];
  }
  if (status === "trial") where.subscription = { status: "trialing" };
  if (status === "active") where.subscription = { status: "active" };
  if (status === "none") where.subscription = null;

  return prisma.company.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { name: true, email: true } },
      city: { select: { name: true } },
      state: { select: { uf: true } },
      businessCategory: { select: { name: true } },
      subscription: true,
    },
  });
}

export async function getCompanyDetails(id: number) {
  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, createdAt: true } },
      city: { select: { name: true } },
      state: { select: { name: true, uf: true } },
      businessCategory: { select: { name: true } },
      subscription: true,
    },
  });
  if (!company) return null;

  const [customers, budgets, total, recentBudgets] = await Promise.all([
    prisma.customer.count({ where: { companyId: id } }),
    prisma.budget.count({ where: { companyId: id } }),
    prisma.budget.aggregate({ where: { companyId: id }, _sum: { total: true } }),
    prisma.budget.findMany({
      where: { companyId: id },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { customer: { select: { name: true } } },
    }),
  ]);

  return { company, customers, budgets, total: total._sum.total, recentBudgets };
}

export async function listUsers(query = "") {
  const search = query.trim();
  return prisma.user.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {},
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      company: { select: { id: true, name: true } },
    },
  });
}

export async function listBudgets(search = "", status = "") {
  const where: Prisma.BudgetWhereInput = {};
  const q = search.trim();
  if (status) where.status = status as Prisma.EnumBudgetStatusFilter["equals"];
  if (q) {
    where.OR = [
      { number: { contains: q, mode: "insensitive" } },
      { customer: { name: { contains: q, mode: "insensitive" } } },
      { company: { name: { contains: q, mode: "insensitive" } } },
    ];
  }

  return prisma.budget.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      company: { select: { id: true, name: true } },
      customer: { select: { name: true } },
    },
  });
}

export async function getBudgetDetails(id: number) {
  return prisma.budget.findUnique({
    where: { id },
    include: {
      company: { select: { id: true, name: true } },
      customer: { select: { name: true, phone: true, email: true } },
      items: true,
      events: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function listSubscriptions() {
  return prisma.subscription.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { company: { select: { id: true, name: true } } },
  });
}

export async function listEvents() {
  return prisma.budgetEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      budget: {
        select: {
          id: true,
          number: true,
          company: { select: { id: true, name: true } },
        },
      },
    },
  });
}
