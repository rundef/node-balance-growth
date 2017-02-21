export interface BalanceInTime<T> {
  date: T;
  balance: number;
}

export interface TransactionInTime<T> {
  date: T;
  amount: number;
}

export interface AdjustParams {
  balances: BalanceInTime<string>[];
  transactions?: TransactionInTime<string>[];
}

export interface MonthlyBalance {
  month: string;
  startBalance: number;
  endBalance: number|null;
}

export class BalanceAdjuster {
  constructor();

  adjust(params: AdjustParams): MonthlyBalance[];
  getAdjustedBalances(balances: BalanceInTime<string>[], _transactions: TransactionInTime<string>[]): BalanceInTime<string>[];
}
