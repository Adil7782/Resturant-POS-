'use client';

import { useState, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Plus, Minus, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import CheckoutModal from './checkout-modal';
import { Product } from '@/lib/generated/prisma/client';


type ProductWithCategoryName = Product & { category: string };

interface CartItem {
  product: ProductWithCategoryName;
  quantity: number;
}

interface POSInterfaceProps {
  // 2. Use parentheses to ensure the array contains the modified objects
  products: (Product & { category: string })[];
  userId: number;
}



export default function POSInterface({ products, userId }: POSInterfaceProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Get unique categories
  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(products.map(p => p.category)))];
  }, [products]);

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || selectedCategory === 'All' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  // Calculate cart totals
  const cartTotals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, [cart]);

  const addToCart = (product: ProductWithCategoryName) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
    toast.success(`${product.name} added to cart`);
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeFromCart = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
    toast.success('Item removed from cart');
  };

  const clearCart = () => {
    setCart([]);
    toast.success('Cart cleared');
  };

  const handleCheckout = async (paymentMethod: string) => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    try {
      const response = await fetch('/api/pos/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          items: cart,
          paymentMethod,
          total: cartTotals.total
        })
      });

      if (!response.ok) {
        throw new Error('Checkout failed');
      }

      const data = await response.json();
      toast.success(`Transaction #${data.transactionId} completed!`);
      setCart([]);
      setIsCheckoutOpen(false);
    } catch (error) {
      toast.error('Failed to complete checkout');
      console.error('Checkout error:', error);
    }
  };

  return (
    <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 bg-background">
      {/* Products Section */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory || 'All'} onValueChange={setSelectedCategory}>
          <TabsList className="w-full justify-start">
            {categories.map(cat => (
              <TabsTrigger key={cat} value={cat}>{cat}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Products Grid */}
        <ScrollArea className="h-[calc(100vh-320px)]">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pr-4">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="p-3 bg-card border border-border rounded-lg hover:bg-accent transition-colors text-left"
              >
                <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                <p className="text-xs text-muted-foreground">{product.category}</p>
                <p className="text-lg font-bold mt-2 text-primary">${product.price.toFixed(2)}</p>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Cart Section */}
      <div className="flex flex-col gap-4 h-full">
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Cart ({cart.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4">
            {cart.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <p>No items in cart</p>
              </div>
            ) : (
              <>
                <ScrollArea className="flex-1">
                  <div className="space-y-3 pr-4">
                    {cart.map(item => (
                      <div
                        key={item.product.id}
                        className="bg-accent p-3 rounded-lg space-y-2"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{item.product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              ${item.product.price.toFixed(2)} each
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.product.id)}
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 1)}
                            className="h-7 text-center w-12"
                            min="1"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <span className="text-sm font-semibold flex-1 text-right">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Totals */}
                <div className="space-y-2 border-t border-border pt-3">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${cartTotals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax (10%):</span>
                    <span>${cartTotals.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t border-border pt-2 mt-2">
                    <span>Total:</span>
                    <span>${cartTotals.total.toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-2">
          {cart.length > 0 && (
            <>
              <CheckoutModal
                total={cartTotals.total}
                onCheckout={handleCheckout}
                isOpen={isCheckoutOpen}
                onOpenChange={setIsCheckoutOpen}
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={clearCart}
              >
                Clear Cart
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
