import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardOverview from '@/components/dashboard-overview';
import prisma from '@/lib/prisma';

export const metadata = {
  title: 'Dashboard - Swift Flow',
  description: 'POS Dashboard Overview'
};

export default async function DashboardPage() {
  const user = await getSession();

  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'admin') {
    redirect('/dashboard/pos');
  }

  try {
    const [products, inventoryData, transactions, alertsData] = await Promise.all([
      prisma.product.findMany(),
      prisma.inventory.findMany({
        include: {
          product: {
            select: {
              name: true
            }
          }
        }
      }),
      prisma.transaction.findMany({ take: 10 }),
      prisma.stockAlert.findMany({
        include: {
          product: {
            select: {
              name: true
            }
          }
        }
      })
    ]);

    const mappedInventory = inventoryData.map(item => ({
      ...item,
      name: item.product.name,
    }));

    const mappedAlerts = alertsData.map(alert => ({
      ...alert,
      name: alert.product.name,
    }));

    return (
      <div className="p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome back, {user.name}!</p>
        </div>

        <DashboardOverview
          products={products}
          inventory={mappedInventory}
          transactions={transactions}
          alerts={mappedAlerts}
        />
      </div>
    );
  } catch (error) {
    console.error('Error loading dashboard:', error);
    return (
      <div className="p-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load dashboard data</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">An error occurred while loading the dashboard. Please try refreshing the page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
}
