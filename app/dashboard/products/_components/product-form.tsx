"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "sonner";
import { ProductFormValues, productSchema } from "@/lib/validations/product-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Product, Category } from "@/lib/generated/prisma/client";

interface ProductFormProps {
  initialData?: Product;
  categories: Category[];
  onSuccess?: () => void;
}

export default function ProductForm({ initialData, categories, onSuccess }: ProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData
      ? {
        name: initialData.name,
        categoryId: initialData.categoryId,
        price: initialData.price,
        cost: initialData.cost,
        description: initialData.description || "",
        sku: initialData.sku || "",
        active: initialData.active,
      }
      : {
        name: "",
        categoryId: categories.length > 0 ? categories[0].id : 0,
        price: 0,
        cost: 0,
        description: "",
        sku: "",
        active: true,
      },
  });

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setIsLoading(true);
      if (initialData) {
        // Update
        await axios.put(`/api/products/${initialData.id}`, data);
        toast.success("Product updated successfully.");
      } else {
        // Create
        await axios.post("/api/products", data);
        toast.success("Product created successfully.");

      }

      router.refresh();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input disabled={isLoading} placeholder="e.g. Classic Burger" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (Rs)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cost (Rs)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  disabled={isLoading}
                  onValueChange={(val) => field.onChange(parseInt(val, 10))}
                  value={field.value.toString()}
                  defaultValue={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <FormControl>
                  <Input disabled={isLoading} placeholder="e.g. BRG-001" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea disabled={isLoading} placeholder="Short description..." {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Active</FormLabel>
                <p className="text-sm text-muted-foreground">
                  This product is visible in the POS and available for sale.
                </p>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-4">
          <Button disabled={isLoading} type="submit">
            {isLoading ? "Saving..." : initialData ? "Save Changes" : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
