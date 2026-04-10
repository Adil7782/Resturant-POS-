import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";
import { productSchema } from "@/lib/validations/product-schema";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    const user = await getSession();

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = productSchema.parse(body);

    const product = await prisma.product.create({
      data: {
        name: validatedData.name,
        price: validatedData.price,
        cost: validatedData.cost,
        categoryId: validatedData.categoryId,
        description: validatedData.description,
        sku: validatedData.sku,
        active: validatedData.active,
        // Also initialize an empty inventory record for the new product
        inventory: {
          create: {
            quantityOnHand: 0,
            reorderLevel: 10,
          }
        }
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Failed to create product:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid input", errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: "Failed to create product" }, { status: 500 });
  }
}
