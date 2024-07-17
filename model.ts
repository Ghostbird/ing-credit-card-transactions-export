export interface Entry {
  amount: number;
  currency: string;
  date: Date;
  conversionFee?: number;
  description: string;
  exchangeRate?: string;
  originalAmount?: number;
  originalCurrency?: string;
}
