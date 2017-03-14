export interface BalanceInTime<T> {
  date: T;
  balance: number;
  eodBalance?: number;
}

export interface TransactionInTime<T> {
  date: T;
  amount: number;
}

export interface MonthlyBalance {
  month: string;
  balance: number;
  eomBalance: number|null;
}

export interface MonthlyBalanceGrowth extends MonthlyBalance {
  growth: number;
}

export interface Params<T> {
  balances: BalanceInTime<T>[];
  transactions?: TransactionInTime<T>[];
  maxDate?: string;
}

export class BalanceAdjuster {
  constructor();
  getAdjustedBalances(p: Params<string>): BalanceInTime<string>[];
}

export class MonthlyBalanceAdjuster extends BalanceAdjuster {
  getMonthlyBalances(p: Params<string>): MonthlyBalance[];
}

export class BalanceGrowth extends MonthlyBalanceAdjuster {
  getGrowth(p: Params<string>): MonthlyBalanceGrowth[];
}
