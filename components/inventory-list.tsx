'use client';

import { useState, useMemo } from 'react';
import { Inventory } from '@/lib/generated/prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle, Plus, Minus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import RestockModal from './restock-modal';
import axios from 'axios';
import router, { Router } from 'next/router';
import { useRouter } from 'next/navigation';

interface InventoryListProps {
  inventory: (Inventory & { name: string })[];
  userId: number;
}

export default function InventoryList({ inventory, userId }: InventoryListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<(Inventory & { name: string }) | null>(null);
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [adjustmentQty, setAdjustmentQty] = useState(0);
  const router = useRouter();
  const filteredInventory = useMemo(() => {
    return inventory.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [inventory, searchTerm]);

  const lowStockItems = filteredInventory.filter(
    item => item.quantityOnHand < item.reorderLevel
  ).length;

  const handleRestock = (item: Inventory & { name: string }) => {
    setSelectedItem(item);
    setIsRestockOpen(true);
  };

  const handleAdjust = (item: Inventory & { name: string }) => {
    setSelectedItem(item);
    setAdjustmentQty(0);
    setIsAdjustOpen(true);
  };

  const submitRestock = async (quantity: number) => {
    if (!selectedItem) return;

    try {
      const response = await axios.post('/api/inventory/update', {
        productId: selectedItem.productId,
        quantityChange: quantity,
        changeType: 'RESTOCK',
        userId,
        notes: 'Admin restock'
      });

      if (response.status !== 200) {
        throw new Error('Restock failed');
      }

      toast.success(`Restocked ${selectedItem.name}`);

      setIsRestockOpen(false);
      setSelectedItem(null);
      router.refresh()

      // Refresh would need to be handled by parent
    } catch (error) {
      toast.error('Failed to restock');
      console.error('Restock error:', error);
    }
  };

  const submitAdjustment = async () => {
    if (!selectedItem || adjustmentQty === 0) return;

    try {
      const response = await axios.post('/api/inventory/update', {
        productId: selectedItem.productId,
        quantityChange: adjustmentQty,
        changeType: 'ADJUSTMENT',
        userId,
        notes: 'Manual adjustment'
      });

      if (response.status !== 200) {
        throw new Error('Adjustment failed');
      }

      toast.success('Inventory adjusted');
      setIsAdjustOpen(false);
      setSelectedItem(null);
      setAdjustmentQty(0);
      router.refresh()
    } catch (error) {
      toast.error('Failed to adjust inventory');
      console.error('Adjustment error:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredInventory.length}</div>
            <p className="text-xs text-muted-foreground">Products in inventory</p>
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
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Calculating...</div>
            <p className="text-xs text-muted-foreground">Inventory value</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
      </div>

      {/* Inventory Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead className="text-right">On Hand</TableHead>
                <TableHead className="text-right">Reorder Level</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Last Restocked</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item) => {
                const isLowStock = item.quantityOnHand < item.reorderLevel;
                const lastRestocked = item.lastRestockedAt
                  ? new Date(item.lastRestockedAt).toLocaleDateString()
                  : 'Never';

                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right">{item.quantityOnHand}</TableCell>
                    <TableCell className="text-right">{item.reorderLevel}</TableCell>
                    <TableCell className="text-center">
                      {isLowStock ? (
                        <span className="px-2 py-1 bg-destructive/10 text-destructive text-xs rounded-full">
                          Low Stock
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full dark:bg-green-900 dark:text-green-100">
                          OK
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{lastRestocked}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestock(item)}
                        className="h-8"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Restock
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAdjust(item)}
                        className="h-8"
                      >
                        <Minus className="w-3 h-3 mr-1" />
                        Adjust
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modals */}
      {selectedItem && (
        <>
          <RestockModal
            isOpen={isRestockOpen}
            onOpenChange={setIsRestockOpen}
            productName={selectedItem.name}
            currentQuantity={selectedItem.quantityOnHand}
            onSubmit={submitRestock}
          />

          {/* Adjust Modal */}
          {isAdjustOpen && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
              <Card className="w-96">
                <CardHeader>
                  <CardTitle>Adjust Inventory</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium">{selectedItem.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Current: {selectedItem.quantityOnHand} units
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Quantity Change</label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setAdjustmentQty(adjustmentQty - 1)}
                        className="w-12"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Input
                        type="number"
                        value={adjustmentQty}
                        onChange={(e) => setAdjustmentQty(parseInt(e.target.value) || 0)}
                        className="text-center"
                      />
                      <Button
                        variant="outline"
                        onClick={() => setAdjustmentQty(adjustmentQty + 1)}
                        className="w-12"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsAdjustOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={submitAdjustment}
                      disabled={adjustmentQty === 0}
                      className="flex-1"
                    >
                      Apply
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
