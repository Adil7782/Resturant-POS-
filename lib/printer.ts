/**
 * Thermal Printer Utility for Epson TM-T81III
 * This is a testable utility that can be connected to real hardware later.
 * Currently logs to console for testing purposes.
 */

export interface PrinterConfig {
  ip?: string;
  port?: number;
  usb?: string;
  paperWidth?: number; // in characters, default 40
}

export interface ReceiptItem {
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Receipt {
  transactionId: number;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  timestamp: Date;
  storeName?: string;
  storeAddress?: string;
  cashierName?: string;
}

export class ThermalPrinter {
  private config: Required<PrinterConfig>;
  private isConnected: boolean = false;
  private paperWidth: number;

  constructor(config: PrinterConfig = {}) {
    this.config = {
      ip: config.ip || 'localhost',
      port: config.port || 9100,
      usb: config.usb || '',
      paperWidth: config.paperWidth || 40
    };
    this.paperWidth = this.config.paperWidth;
  }

  /**
   * Connect to the printer
   */
  async connect(): Promise<boolean> {
    try {
      console.log('[Printer] Attempting connection...');
      console.log(`[Printer] Config: IP=${this.config.ip}, Port=${this.config.port}, USB=${this.config.usb}`);
      
      // In a real implementation, this would attempt to connect to the printer
      // For now, we simulate a successful connection
      this.isConnected = true;
      console.log('[Printer] Connected successfully');
      return true;
    } catch (error) {
      console.error('[Printer] Connection failed:', error);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Disconnect from the printer
   */
  async disconnect(): Promise<void> {
    console.log('[Printer] Disconnecting...');
    this.isConnected = false;
  }

  /**
   * Print a receipt
   */
  async printReceipt(receipt: Receipt): Promise<boolean> {
    if (!this.isConnected) {
      console.warn('[Printer] Not connected. Call connect() first.');
      return false;
    }

    try {
      const escPosCommands = this.generateESCPOSCommands(receipt);
      
      console.log('[Printer] Printing receipt...');
      console.log('[Printer] ESC/POS Commands:');
      console.log(escPosCommands);
      
      // In a real implementation, send to actual printer
      await this.sendToPrinter(escPosCommands);
      
      console.log('[Printer] Receipt printed successfully');
      return true;
    } catch (error) {
      console.error('[Printer] Print failed:', error);
      return false;
    }
  }

  /**
   * Print a test pattern
   */
  async printTestPattern(): Promise<boolean> {
    if (!this.isConnected) {
      console.warn('[Printer] Not connected');
      return false;
    }

    try {
      const testPattern = `
╔════════════════════════════════════╗
║       THERMAL PRINTER TEST         ║
║          Swift Flow POS            ║
╚════════════════════════════════════╝

Testing basic alignment and formatting...

LEFT    CENTER    RIGHT
Test    Test      Test

Line 1: Normal text
Line 2: Bold text (simulated)
Line 3: Large text (simulated)

[X] Test successful - printer ready!

════════════════════════════════════
      Test completed successfully
════════════════════════════════════
`;
      console.log('[Printer] Test pattern:');
      console.log(testPattern);
      return true;
    } catch (error) {
      console.error('[Printer] Test failed:', error);
      return false;
    }
  }

  /**
   * Generate ESC/POS commands for the receipt
   */
  private generateESCPOSCommands(receipt: Receipt): string {
    let commands = '';

    // Reset printer
    commands += '\x1B\x40';

    // Set code page to Western European
    commands += '\x1B\x74\x00';

    // Enable Chinese character mode if needed
    // commands += '\x1B\x52\x00';

    // Print header
    if (receipt.storeName) {
      commands += this.centerText(receipt.storeName);
    }
    if (receipt.storeAddress) {
      commands += this.centerText(receipt.storeAddress);
    }

    commands += this.centerText('═'.repeat(this.paperWidth - 2));
    commands += '\n';

    // Print transaction info
    commands += `Transaction #${receipt.transactionId}\n`;
    commands += `${this.formatDate(receipt.timestamp)}\n`;
    if (receipt.cashierName) {
      commands += `Cashier: ${receipt.cashierName}\n`;
    }

    commands += this.centerText('─'.repeat(this.paperWidth - 2));
    commands += '\n';

    // Print items
    commands += 'ITEM                      QTY    PRICE\n';
    commands += this.centerText('─'.repeat(this.paperWidth - 2));
    commands += '\n';

    for (const item of receipt.items) {
      commands += this.formatItemLine(item);
    }

    commands += this.centerText('─'.repeat(this.paperWidth - 2));
    commands += '\n';

    // Print totals
    commands += this.formatTotalLine('Subtotal', receipt.subtotal);
    commands += this.formatTotalLine('Tax (10%)', receipt.tax);
    commands += '\n';
    commands += this.formatTotalLine('TOTAL', receipt.total, true);

    commands += '\n';
    commands += this.centerText('═'.repeat(this.paperWidth - 2));
    commands += '\n';

    // Payment method
    commands += this.centerText(`Payment: ${receipt.paymentMethod.toUpperCase()}`);
    commands += '\n\n';

    // Thank you message
    commands += this.centerText('Thank you for your purchase!');
    commands += this.centerText('Please come again.');

    // Paper cut (if supported)
    commands += '\n\n';
    commands += '\x1B\x69'; // Partial cut

    return commands;
  }

  /**
   * Format text to center on the paper
   */
  private centerText(text: string): string {
    const padding = Math.max(0, Math.floor((this.paperWidth - text.length) / 2));
    return ' '.repeat(padding) + text + '\n';
  }

  /**
   * Format item line for receipt
   */
  private formatItemLine(item: ReceiptItem): string {
    const nameLen = 24;
    const qtyLen = 4;
    const priceLen = 8;

    const name = item.name.substring(0, nameLen).padEnd(nameLen);
    const qty = String(item.quantity).padStart(qtyLen);
    const price = `$${item.subtotal.toFixed(2)}`.padStart(priceLen);

    return `${name}${qty}${price}\n`;
  }

  /**
   * Format total line
   */
  private formatTotalLine(label: string, amount: number, isBold: boolean = false): string {
    const value = `$${amount.toFixed(2)}`;
    const spaces = this.paperWidth - label.length - value.length;
    const line = label + ' '.repeat(Math.max(1, spaces)) + value + '\n';

    if (isBold) {
      // ESC/POS bold command would be added here
      // For now, just return the line
    }

    return line;
  }

  /**
   * Format date for receipt
   */
  private formatDate(date: Date): string {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  /**
   * Send commands to printer (placeholder for actual implementation)
   */
  private async sendToPrinter(commands: string): Promise<void> {
    // In a real implementation:
    // - For network printer: Use fetch/TCP socket to send to printer IP:port
    // - For USB printer: Use WebUSB or native integration
    // - For serial port: Use Web Serial API

    console.log('[Printer] Sending to printer:', {
      ip: this.config.ip,
      port: this.config.port,
      usb: this.config.usb,
      commandLength: commands.length
    });

    // Simulated delay
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  /**
   * Check if connected
   */
  isConnectedStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Get configuration
   */
  getConfig(): PrinterConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<PrinterConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('[Printer] Configuration updated:', this.config);
  }
}

// Export singleton instance for convenience
export const printerInstance = new ThermalPrinter({
  ip: process.env.PRINTER_IP || 'localhost',
  port: parseInt(process.env.PRINTER_PORT || '9100'),
  usb: process.env.PRINTER_USB || '',
  paperWidth: 40
});
