import { NextRequest, NextResponse } from 'next/server';
import { printerInstance } from '@/lib/printer';

export async function POST(request: NextRequest) {
  try {
    const { ip, port, usb } = await request.json();

    // Update configuration if provided
    if (ip || port || usb) {
      printerInstance.updateConfig({
        ip: ip || undefined,
        port: port || undefined,
        usb: usb || undefined
      });
    }

    // Attempt to connect
    const success = await printerInstance.connect();

    if (success) {
      return NextResponse.json(
        { message: 'Printer connected', isConnected: true },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: 'Failed to connect to printer', isConnected: false },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Printer connect error:', error);
    return NextResponse.json(
      { message: 'Error connecting to printer' },
      { status: 500 }
    );
  }
}
