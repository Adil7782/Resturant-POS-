'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';

interface RestockModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  currentQuantity: number;
  onSubmit: (quantity: number) => void;
}

export default function RestockModal({
  isOpen,
  onOpenChange,
  productName,
  currentQuantity,
  onSubmit
}: RestockModalProps) {
  const [quantity, setQuantity] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!quantity || parseInt(quantity) <= 0) return;
    
    setIsLoading(true);
    try {
      await onSubmit(parseInt(quantity));
      setQuantity('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Restock Product</DialogTitle>
          <DialogDescription>
            Add stock to {productName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="bg-accent">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Current Stock</p>
              <p className="text-2xl font-bold">{currentQuantity} units</p>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <label className="text-sm font-medium">Quantity to Add</label>
            <Input
              type="number"
              placeholder="Enter quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              disabled={isLoading}
              min="1"
            />
          </div>

          {quantity && (
            <Card className="bg-accent">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">New Total</p>
                <p className="text-2xl font-bold">{currentQuantity + parseInt(quantity)} units</p>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!quantity || parseInt(quantity) <= 0 || isLoading}
              className="flex-1"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isLoading ? 'Restocking...' : 'Restock'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
