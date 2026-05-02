export type ReceiptType = 'quickpay' | 'payroll';

export interface ReceiptRecipient {
  name?: string;
  address: string;
  amountCrypto?: number;
  amountUsd?: number;
}

export interface Receipt {
  id: string;
  type: ReceiptType;
  txHash: string;
  network: string;
  currency: string;
  totalUsd: number;
  totalCrypto: number;
  gasFee?: string;
  from: string;
  recipients: ReceiptRecipient[];
  createdAt: Date;
}