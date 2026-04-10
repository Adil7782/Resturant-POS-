import { neon } from '@neondatabase/serverless';

export const sql = neon(process.env.DATABASE_URL!);




export type Inventory = {
  id: number;
  productId: number;
  quantityOnHand: number;
  reorderLevel: number;
  lastRestockedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Transaction = {
  id: number;
  transactionId: string;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  cashierId: number;
};

export type TransactionItem = {
  id: number;
  transactionId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type StockAlert = {
  id: number;
  productId: number;
  alertType: string;
  message: string;
  resolved: boolean;
  createdAt: string;
  resolvedAt: string | null;
};

export type InventoryLog = {
  id: number;
  productId: number;
  quantityChange: number;
  changeType: string;
  notes: string | null;
  userId: number;
  createdAt: string;
};

// Product queries
export async function getProducts() {
  return sql<(Product & { category: string })[]>`
    SELECT p.*, c.name as category 
    FROM products p 
    JOIN categories c ON p."categoryId" = c.id 
    WHERE p.active = true 
    ORDER BY category, name
  `;
}

export async function getProductById(id: number) {
  return sql<Product[]>`SELECT * FROM products WHERE id = ${id}`;
}

export async function getProductsByCategory(category: string) {
  return sql<Product[]>`SELECT * FROM products WHERE category = ${category} AND active = true ORDER BY name`;
}

// Inventory queries
export async function getInventory() {
  return sql<(Inventory & { name: string })[]>`
    SELECT i.*, p.name as name 
    FROM inventory i 
    JOIN products p ON i."productId" = p.id 
    ORDER BY p."categoryId", p.name
  `;
}

export async function getInventoryByProductId(productId: number) {
  return sql<Inventory[]>`SELECT * FROM inventory WHERE product_id = ${productId}`;
}

export async function updateInventory(productId: number, quantityChange: number, changeType: string, userId: number, notes?: string) {
  // Update inventory quantity
  await sql`
    UPDATE inventory 
    SET "quantityOnHand" = "quantityOnHand" + ${quantityChange},
        "updatedAt" = CURRENT_TIMESTAMP
    WHERE "productId" = ${productId}
  `;

  // Log the change
  await sql`
    INSERT INTO inventory_logs ("productId", "quantityChange", "changeType", notes, "userId", "createdAt")
    VALUES (${productId}, ${quantityChange}, ${changeType}, ${notes || null}, ${userId}, CURRENT_TIMESTAMP)
  `;

  // Check if stock is low
  const [inv] = await sql<Inventory[]>`
    SELECT * FROM inventory WHERE "productId" = ${productId}
  `;

  if (inv && inv.quantityOnHand < inv.reorderLevel) {
    const [product] = await sql<Product[]>`SELECT * FROM products WHERE id = ${productId}`;
    if (product) {
      await sql`
        INSERT INTO stock_alerts ("productId", "alertType", message, "createdAt")
        VALUES (${productId}, 'LOW_STOCK', ${'Stock for ' + product.name + ' is below reorder level'}, CURRENT_TIMESTAMP)
        ON CONFLICT DO NOTHING
      `;
    }
  }
}

// Transaction queries
export async function createTransaction(userId: number, total: number, paymentMethod: string) {
  const transactionId = `ORD-${new Date().getTime()}`;
  const subtotal = total / 1.1; // Reverse engineer subtotal from total (assuming 10% tax)
  const tax = total - subtotal;

  const result = await sql`
    INSERT INTO transactions ("transactionId", subtotal, tax, total, "paymentMethod", status, "cashierId", "createdAt")
    VALUES (${transactionId}, ${subtotal}, ${tax}, ${total}, ${paymentMethod}, 'completed', ${userId}, CURRENT_TIMESTAMP)
    RETURNING *
  `;
  return result[0];
}

export async function getTransactionById(id: number) {
  return sql<Transaction[]>`SELECT * FROM transactions WHERE id = ${id}`;
}

export async function getTransactions(limit: number = 50, offset: number = 0) {
  return sql<Transaction[]>`
    SELECT * FROM transactions 
    ORDER BY "createdAt" DESC 
    LIMIT ${limit} OFFSET ${offset}
  `;
}

export async function getTransactionItems(transactionId: number) {
  return sql<(TransactionItem & { productName: string })[]>`
    SELECT ti.*, p.name as "productName"
    FROM transaction_items ti
    JOIN products p ON ti."productId" = p.id
    WHERE ti."transactionId" = ${transactionId}
    ORDER BY ti.id
  `;
}

export async function addTransactionItem(transactionId: number, productId: number, quantity: number, unitPrice: number) {
  const lineTotal = quantity * unitPrice;
  return sql`
    INSERT INTO transaction_items ("transactionId", "productId", quantity, "unitPrice", "lineTotal")
    VALUES (${transactionId}, ${productId}, ${quantity}, ${unitPrice}, ${lineTotal})
  `;
}

// Stock alert queries
export async function getActiveAlerts() {
  return sql<(StockAlert & { product_name: string })[]>`
    SELECT sa.*, p.name as product_name
    FROM stock_alerts sa
    JOIN products p ON sa.product_id = p.id
    WHERE sa.resolved = false
    ORDER BY sa.created_at DESC
  `;
}

export async function resolveAlert(alertId: number) {
  return sql`
    UPDATE stock_alerts 
    SET resolved = true, resolved_at = CURRENT_TIMESTAMP
    WHERE id = ${alertId}
  `;
}

// Analytics queries
export async function getDailySalesTotal(date: string) {
  const result = await sql<{ total: number }[]>`
    SELECT SUM(total) as total
    FROM transactions
    WHERE DATE("createdAt") = ${date}
  `;
  return result[0]?.total || 0;
}

export async function getSalesForDateRange(startDate: string, endDate: string) {
  return sql<{ date: string; total: number }[]>`
    SELECT 
      DATE("createdAt") as date,
      SUM(total) as total
    FROM transactions
    WHERE "createdAt" >= ${startDate} AND "createdAt" <= ${endDate}
    GROUP BY DATE("createdAt")
    ORDER BY date DESC
  `;
}

export async function getTopProducts(limit: number = 10) {
  return sql<{ productId: number; productName: string; totalQuantity: number; totalRevenue: number }[]>`
    SELECT 
      ti."productId",
      p.name as "productName",
      SUM(ti.quantity) as "totalQuantity",
      SUM(ti."lineTotal") as "totalRevenue"
    FROM transaction_items ti
    JOIN products p ON ti."productId" = p.id
    GROUP BY ti."productId", p.name
    ORDER BY "totalRevenue" DESC
    LIMIT ${limit}
  `;
}
