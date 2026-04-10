import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import InventoryList from '@/components/inventory-list';
import prisma from '@/lib/prisma';

export const metadata = {
  title: 'Inventory - Swift Flow',
  description: 'Inventory Management'
};

export default async function InventoryPage() {
  const user = await getSession();

  if (!user || user.role !== 'admin') {
    redirect('/login');
  }

  try {
    const inventoryData = await prisma.inventory.findMany({
      include: {
        product: {
          select: {
            name: true
          }
        }
      }
    });

    const inventory = inventoryData.map(item => ({
      ...item,
      name: item.product.name
    }));

    return (
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground mt-2">Track and manage product stock levels</p>
        </div>

        <InventoryList inventory={inventory} userId={user.id} />
      </div>
    );
  } catch (error) {
    console.error('Error loading inventory:', error);
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-xl font-bold">Error Loading Inventory</h2>
          <p className="text-muted-foreground mt-2">Please refresh the page</p>
        </div>
      </div>
    );
  }
}
