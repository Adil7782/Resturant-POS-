import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { getTransactions } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DollarSign, TrendingUp } from 'lucide-react';

export const metadata = {
  title: 'Transactions - Swift Flow',
  description: 'Transaction History'
};

export default async function TransactionsPage() {
  const user = await getSession();

  if (!user || user.role !== 'admin') {
    redirect('/login');
  }

  try {
    const transactions = await getTransactions(100);

    const totalSales = transactions.reduce((sum, t) => sum + parseFloat(String(t.total_amount)), 0);
    const avgSale = transactions.length > 0 ? totalSales / transactions.length : 0;

    return (
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground mt-2">View all sales and transactions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transactions.length}</div>
              <p className="text-xs text-muted-foreground">All time sales</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalSales.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Sale</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${avgSale.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Per transaction</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => {
                  const date = new Date(transaction.created_at);
                  const dateStr = date.toLocaleDateString();
                  const timeStr = date.toLocaleTimeString();

                  return (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">#{transaction.id}</TableCell>
                      <TableCell>{dateStr}</TableCell>
                      <TableCell>{timeStr}</TableCell>
                      <TableCell className="capitalize">{transaction.payment_method}</TableCell>
                      <TableCell className="text-right font-semibold">
                        ${parseFloat(String(transaction.total_amount)).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs dark:bg-green-900 dark:text-green-100">
                          {transaction.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error('Error loading transactions:', error);
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-xl font-bold">Error Loading Transactions</h2>
          <p className="text-muted-foreground mt-2">Please refresh the page</p>
        </div>
      </div>
    );
  }
}
