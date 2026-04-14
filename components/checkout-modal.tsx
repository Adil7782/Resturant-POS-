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
import { SegmentedControl } from '@/components/ui/segmented-control';
import { CreditCard, Banknote } from 'lucide-react';

interface CheckoutModalProps {
  total: number;
  onCheckout: (paymentMethod: string) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CheckoutModal({
  total,
  onCheckout,
  isOpen,
  onOpenChange
}: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      await onCheckout(paymentMethod);
    } finally {
      setIsProcessing(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <Button
        className="w-full bg-primary text-primary-foreground"
        onClick={() => onOpenChange(true)}
        disabled={isProcessing}
      >
        Checkout
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Purchase</DialogTitle>
          <DialogDescription>
            Total: <span className="text-lg font-bold text-primary">Rs. {total.toFixed(2)}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Payment Method</label>
            <div className="flex gap-2">
              <Button
                variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('cash')}
                className="flex-1"
                disabled={isProcessing}
              >
                <Banknote className="w-4 h-4 mr-2" />
                Cash
              </Button>
              <Button
                variant={paymentMethod === 'card' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('card')}
                className="flex-1"
                disabled={isProcessing}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Card
              </Button>
            </div>
          </div>

          <div className="bg-accent p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Total Amount Due</p>
            <p className="text-3xl font-bold text-primary mt-1">Rs. {total.toFixed(2)}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="bg-primary text-primary-foreground"
            >
              {isProcessing ? 'Processing...' : 'Complete Payment'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
