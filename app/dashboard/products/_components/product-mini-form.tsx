"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import ProductForm from "./product-form";


interface ProductDialogProps {
    categories: any[]; // Replace with your actual type
}

export const ProductDialog = ({ categories }: ProductDialogProps) => {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
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
                <ProductForm
                    categories={categories}
                    onSuccess={() => setOpen(false)}
                />
            </DialogContent>
        </Dialog>
    );
};