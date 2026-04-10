import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { printerInstance } from '@/lib/printer';

export async function POST(request: NextRequest) {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const isConnected = printerInstance.isConnectedStatus();

    if (!isConnected) {
      return NextResponse.json(
        { message: 'Printer not connected' },
        { status: 400 }
      );
    }

    const success = await printerInstance.printTestPattern();

    if (success) {
      return NextResponse.json(
        { message: 'Test pattern printed successfully' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: 'Failed to print test pattern' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Printer test error:', error);
    return NextResponse.json(
      { message: 'Error printing test pattern' },
      { status: 500 }
    );
  }
}
