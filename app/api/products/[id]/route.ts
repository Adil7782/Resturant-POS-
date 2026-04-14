import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";
import { productSchema } from "@/lib/validations/product-schema";
import { z } from "zod";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSession();

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return NextResponse.json({ message: "Invalid product ID" }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = productSchema.parse(body);

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        name: validatedData.name,
        price: validatedData.price,
        cost: validatedData.cost,
        categoryId: validatedData.categoryId,
        description: validatedData.description,
        sku: validatedData.sku,
        active: validatedData.active,
      },
    });

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error("Failed to update product:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid input", errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSession();

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return NextResponse.json({ message: "Invalid product ID" }, { status: 400 });
    }

    // Hard delete - Cascade delete will handle related Inventory etc (from Prisma schema)
    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({ message: "Product deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete product:", error);
    return NextResponse.json({ message: "Failed to delete product" }, { status: 500 });
  }
}
