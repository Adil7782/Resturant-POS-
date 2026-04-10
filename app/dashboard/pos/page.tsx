import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { getProducts } from '@/lib/db';
import POSInterface from '@/components/pos-interface';
import prisma from '@/lib/prisma';

export const metadata = {
  title: 'POS - Swift Flow',
  description: 'Point of Sale Interface'
};

export default async function POSPage() {
  const user = await getSession();

  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'cashier') {
    redirect('/dashboard');
  }

  try {
    const productsData = await prisma.product.findMany({
      include: {
        inventory: true,
        category: true,
      },
      where: {
        active: true,
      },
    });

    const products = productsData.map(product => ({
      ...product,
      category: product.category.name,
    }));

    return (
      <div className="h-full">
        <POSInterface products={products} userId={user.id} />
      </div>
    );
  } catch (error) {
    console.error('Error loading POS:', error);
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-xl font-bold">Error Loading POS</h2>
          <p className="text-muted-foreground mt-2">Please refresh the page</p>
        </div>
      </div>
    );
  }
}
