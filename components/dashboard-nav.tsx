'use client';

import { User } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LogOut, ShoppingCart, Package, BarChart3, Users } from 'lucide-react';
import { useState } from 'react';

interface DashboardNavProps {
  user: User;
}

export default function DashboardNav({ user }: DashboardNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  const navItems = [
    ...(user.role === 'cashier'
      ? [
          { href: '/dashboard/pos', label: 'POS', icon: ShoppingCart }
        ]
      : []),
    ...(user.role === 'admin'
      ? [
          { href: '/dashboard', label: 'Overview', icon: BarChart3 },
          { href: '/dashboard/products', label: 'Products', icon: Package },
          { href: '/dashboard/inventory', label: 'Inventory', icon: Package },
          { href: '/dashboard/transactions', label: 'Transactions', icon: ShoppingCart }
        ]
      : [])
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <nav className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-foreground">Swift Flow</h1>
        <p className="text-xs text-muted-foreground mt-1">POS System</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <button
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-border space-y-3">
        <div className="text-xs">
          <p className="text-muted-foreground">Logged in as</p>
          <p className="font-semibold text-foreground">{user.name}</p>
          <p className="text-muted-foreground capitalize">{user.role}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </Button>
      </div>
    </nav>
  );
}
