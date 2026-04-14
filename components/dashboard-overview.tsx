import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Package, DollarSign, TrendingUp } from 'lucide-react';
import { Product } from '@/lib/generated/prisma/client';
import { Inventory, Transaction, StockAlert } from '@/lib/generated/prisma/client';

interface DashboardOverviewProps {
  products: Product[];
  inventory: (Inventory & { name: string })[];
  transactions: Transaction[];
  alerts: (StockAlert & { name: string })[];
}

export default function DashboardOverview({
  products,
  inventory,
  transactions,
  alerts
}: DashboardOverviewProps) {
  // Calculate metrics
  const totalProducts = products.length;
  const lowStockItems = inventory.filter(i => i.quantityOnHand < i.reorderLevel).length;
  const totalSales = transactions.reduce((sum, t) => sum + parseFloat(String(t.total)), 0);
  const avgTransactionValue = transactions.length > 0 ? totalSales / transactions.length : 0;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">Active menu items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Below reorder level</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {totalSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{transactions.length} transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Transaction</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {avgTransactionValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Stock Alerts</CardTitle>
            <CardDescription>Items below reorder level</CardDescription>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active alerts</p>
            ) : (
              <div className="space-y-3">
                {alerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start justify-between p-3 bg-accent rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{alert.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{alert.status}</p>
                    </div>
                  </div>
                ))}
                {alerts.length > 5 && (
                  <p className="text-xs text-muted-foreground pt-2">
                    +{alerts.length - 5} more alerts
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest sales</CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No transactions yet</p>
            ) : (
              <div className="space-y-2">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-2 hover:bg-accent rounded"
                  >
                    <div>
                      <p className="text-sm font-medium">Transaction #{transaction.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="font-semibold">Rs. {transaction.total.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
