import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { Plus } from 'lucide-react';
import prisma from '@/lib/prisma';
import ProductsTable from './_components/products-table';
import ProductForm from './_components/product-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export const metadata = {
  title: 'Products - Swift Flow',
  description: 'Product Management'
};

export default async function ProductsPage() {
  const user = await getSession();

  if (!user || user.role !== 'admin') {
    redirect('/login');
  }

  try {
    const prods = await prisma.product.findMany({
      where: {
        active: true
      },
      include: {
        category: true,
        inventory: true
      }
    });
    const products = prods.map(p => ({
      ...p,
      category: p.category.name,
    }));
    const categories = await prisma.category.findMany();

    // Group by category
    // const categories = Array.from(new Set(products.map(p => p.category)));

    return (
      <div className="p-8 space-y-6">
        <div className="flex justify-between items-center bg-background top-0 sticky py-2 z-10">
          <div>
            <h1 className="text-3xl font-bold">Products</h1>
            <p className="text-muted-foreground mt-2">View and manage menu items</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Enter the details for the new product here.
                </DialogDescription>
              </DialogHeader>
              <ProductForm categories={categories} />
            </DialogContent>
          </Dialog>
        </div>

        <ProductsTable products={products} categories={categories} />
      </div>
    );
  } catch (error) {
    console.error('Error loading products:', error);
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-xl font-bold">Error Loading Products</h2>
          <p className="text-muted-foreground mt-2">Please refresh the page</p>
        </div>
      </div>
    );
  }
}
