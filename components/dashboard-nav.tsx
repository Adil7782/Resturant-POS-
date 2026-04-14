'use client';

import { User } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LogOut, ShoppingCart, Package, BarChart3, PanelLeftClose, PanelRightClose } from 'lucide-react';
import { useState } from 'react';

interface DashboardNavProps {
  user: User;
}

export default function DashboardNav({ user }: DashboardNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  const isActive = (href: string) => {
    if (href === '/dashboard' && pathname !== '/dashboard') {
      return false;
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <nav className={`bg-card border-r border-border flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="p-6 border-b border-border flex items-center justify-between">
        {!isCollapsed && (
          <div>
            <h1 className="text-2xl font-bold text-foreground truncate">Swift Flow</h1>
            <p className="text-xs text-muted-foreground mt-1 truncate">POS System</p>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className="shrink-0"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <PanelRightClose className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link 
              key={item.href} 
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-accent hover:text-accent-foreground'
              } ${isCollapsed ? 'justify-center px-2' : ''}`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-border space-y-3">
        {!isCollapsed && (
          <div className="text-xs truncate">
            <p className="text-muted-foreground">Logged in as</p>
            <p className="font-semibold text-foreground truncate">{user.name}</p>
            <p className="text-muted-foreground capitalize truncate">{user.role}</p>
          </div>
        )}
        <Button
          variant="outline"
          size={isCollapsed ? "icon" : "sm"}
          className={`w-full ${isCollapsed ? 'justify-center' : ''}`}
          onClick={handleLogout}
          disabled={isLoggingOut}
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut className={`w-4 h-4 ${!isCollapsed ? 'mr-2' : ''}`} />
          {!isCollapsed && (isLoggingOut ? 'Logging out...' : 'Logout')}
        </Button>
      </div>
    </nav>
  );
}
