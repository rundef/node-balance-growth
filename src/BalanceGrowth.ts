import * as moment from 'moment';
import {Params, MonthlyBalanceGrowth, MonthlyBalance} from '../index.d';
import {MonthlyBalanceAdjuster} from './MonthlyBalanceAdjuster';

export class BalanceGrowth extends MonthlyBalanceAdjuster {
  public getGrowth(p: Params<string>): MonthlyBalanceGrowth[] {
    return <MonthlyBalanceGrowth[]> this.getMonthlyBalances(p).map((b: MonthlyBalance): MonthlyBalanceGrowth => {
      if (b.eomBalance === null) {
        return {
          month: b.month,
          balance: b.balance,
          eomBalance: null,
          growth: null
        };
      }

      return {
        month: b.month,
        balance: b.balance,
        eomBalance: b.eomBalance,
        growth: b.balance === 0 ? 0 : Math.round(100 * ((b.eomBalance / b.balance) - 1))
      };
    });
  }
}
