import { ReactNode } from 'react';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import DashboardNav from '@/components/dashboard-nav';

export const metadata = {
  title: 'Dashboard - Swift Flow POS',
  description: 'Restaurant POS & Inventory Management Dashboard'
};

export default async function DashboardLayout({
  children
}: {
  children: ReactNode;
}) {
  const user = await getSession();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-background">
      <DashboardNav user={user} />
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
