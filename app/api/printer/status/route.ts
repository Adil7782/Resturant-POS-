import { NextRequest, NextResponse } from 'next/server';
import { printerInstance } from '@/lib/printer';

export async function GET(request: NextRequest) {
  try {
    const isConnected = printerInstance.isConnectedStatus();
    const config = printerInstance.getConfig();

    return NextResponse.json({
      isConnected,
      config,
      message: isConnected ? 'Printer connected' : 'Printer not connected'
    });
  } catch (error) {
    console.error('Printer status error:', error);
    return NextResponse.json(
      { message: 'Failed to get printer status' },
      { status: 500 }
    );
  }
}
