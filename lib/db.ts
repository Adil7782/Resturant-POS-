import { revalidatePath } from 'next/cache';
import prisma from './prisma';

// Product queries
export async function getProducts() {
  const products = await prisma.product.findMany({
    where: { active: true },
    include: { category: true },
    orderBy: [
      { category: { name: 'asc' } },
      { name: 'asc' }
    ]
  });
  return products.map(p => ({
    ...p,
    category: p.category.name,
  }));
}

export async function getProductById(id: number) {
  const product = await prisma.product.findUnique({ where: { id } });
  return product ? [product] : [];
}

export async function getProductsByCategory(category: string) {
  return prisma.product.findMany({
    where: { 
      category: { name: category }, 
      active: true 
    },
    orderBy: { name: 'asc' }
  });
}

// Inventory queries
export async function getInventory() {
  const inventory = await prisma.inventory.findMany({
    include: { product: true },
    orderBy: [
      { product: { categoryId: 'asc' } },
      { product: { name: 'asc' } }
    ]
  });
  return inventory.map(i => ({
    ...i,
    name: i.product.name,
  }));
}

export async function getInventoryByProductId(productId: number) {
  const inv = await prisma.inventory.findUnique({ where: { productId } });
  return inv ? [inv] : [];
}

export async function updateInventory(productId: number, quantityChange: number, changeType: string, userId: number, notes?: string) {
  // Update inventory quantity
  await prisma.inventory.update({
    where: { productId },
    data: {
      quantityOnHand: { increment: quantityChange }
    }
  });

  // Log the change
  await prisma.inventoryLog.create({
    data: {
      productId,
      quantityChange,
      type: changeType,
      notes: notes || null,
      referenceId: userId.toString(), 
    }
  });

  // Check if stock is low
  const inv = await prisma.inventory.findUnique({
    where: { productId },
    include: { product: true }
  });

  if (inv && inv.quantityOnHand < inv.reorderLevel) {
    const existingAlert = await prisma.stockAlert.findFirst({
      where: {
        productId,
        alertType: 'LOW_STOCK',
        status: 'active'
      }
    });

    if (!existingAlert) {
      await prisma.stockAlert.create({
        data: {
          productId,
          alertType: 'LOW_STOCK',
          status: 'active'
        }
      });
    }
  }
    revalidatePath('/dashboard/inventory');

}

// Transaction queries
export async function createTransaction(userId: number, total: number, paymentMethod: string) {
  const transactionId = `ORD-${new Date().getTime()}`;
  const subtotal = total / 1.1; // Reverse engineer subtotal from total (assuming 10% tax)
  const tax = total - subtotal;

  return prisma.transaction.create({
    data: {
      transactionId,
      subtotal,
      tax,
      total,
      paymentMethod,
      status: 'completed',
      cashierId: userId,
    }
  });
}

export async function getTransactionById(id: number) {
  const t = await prisma.transaction.findUnique({ where: { id } });
  return t ? [t] : [];
}

export async function getTransactions(limit: number = 50, offset: number = 0) {
  return prisma.transaction.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  });
}

export async function getTransactionItems(transactionId: number) {
  const items = await prisma.transactionItem.findMany({
    where: { transactionId },
    include: { product: true },
    orderBy: { id: 'asc' }
  });
  return items.map(item => ({
    ...item,
    productName: item.product.name,
  }));
}

export async function addTransactionItem(transactionId: number, productId: number, quantity: number, unitPrice: number) {
  const lineTotal = quantity * unitPrice;
  return prisma.transactionItem.create({
    data: {
      transactionId,
      productId,
      quantity,
      unitPrice,
      lineTotal,
    }
  });
}

// Stock alert queries
export async function getActiveAlerts() {
  const alerts = await prisma.stockAlert.findMany({
    where: { status: 'active' },
    include: { product: true },
    orderBy: { createdAt: 'desc' }
  });
  return alerts.map(a => ({
    ...a,
    name: a.product.name,
    resolved: a.status === 'resolved'
  }));
}

export async function resolveAlert(alertId: number) {
  return prisma.stockAlert.update({
    where: { id: alertId },
    data: {
      status: 'resolved',
      resolvedAt: new Date()
    }
  });
}

// Analytics queries
export async function getDailySalesTotal(date: string) {
  const targetDate = new Date(date);
  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const result = await prisma.transaction.aggregate({
    _sum: { total: true },
    where: {
      createdAt: {
        gte: targetDate,
        lt: nextDay
      }
    }
  });
  return result._sum.total || 0;
}

export async function getSalesForDateRange(startDate: string, endDate: string) {
  const result = await prisma.$queryRaw<{ date: Date; total: number }[]>`
    SELECT 
      DATE("createdAt") as date,
      SUM(total) as total
    FROM transactions
    WHERE "createdAt" >= ${new Date(startDate)} AND "createdAt" <= ${new Date(endDate)}
    GROUP BY DATE("createdAt")
    ORDER BY date DESC
  `;
  return result.map(r => ({
    date: r.date.toISOString().split('T')[0],
    total: Number(r.total)
  }));
}

export async function getTopProducts(limit: number = 10) {
  const result = await prisma.$queryRaw<{ productId: number; productName: string; totalQuantity: number; totalRevenue: number }[]>`
    SELECT 
      ti."productId",
      p.name as "productName",
      CAST(SUM(ti.quantity) AS INTEGER) as "totalQuantity",
      CAST(SUM(ti."lineTotal") AS FLOAT) as "totalRevenue"
    FROM transaction_items ti
    JOIN products p ON ti."productId" = p.id
    GROUP BY ti."productId", p.name
    ORDER BY "totalRevenue" DESC
    LIMIT ${limit}
  `;
  return result.map(r => ({
    productId: r.productId,
    productName: r.productName,
    totalQuantity: Number(r.totalQuantity),
    totalRevenue: Number(r.totalRevenue),
  }));
}
