import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { updateInventory } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const user = await getSession();

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { productId, quantityChange, changeType, userId, notes } = await request.json();

    if (!productId || quantityChange === undefined) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    await updateInventory(productId, quantityChange, changeType, userId, notes);

    return NextResponse.json(
      { message: 'Inventory updated' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Inventory update error:', error);
    return NextResponse.json(
      { message: 'Failed to update inventory' },
      { status: 500 }
    );
  }
}
