import * as moment from 'moment';
import {Params, BalanceInTime, MonthlyBalance} from '../index.d';
import {BalanceAdjuster} from './BalanceAdjuster';

export class MonthlyBalanceAdjuster extends BalanceAdjuster {
  public getMonthlyBalances(p: Params<string>): MonthlyBalance[] {
    const balances = this.getAdjustedBalances(p).map((b: BalanceInTime<string>): BalanceInTime<moment.Moment> => {
      return {
        balance: b.eodBalance || b.balance,
        date: moment(b.date, 'YYYY-MM-DD')
      };
    });

    const monthlyBalances: MonthlyBalance[] = [];
    let index = 0;
    this.loopEachMonth(balances, p.maxDate, (year: number, month: number): void => {
      const startOfMonth = moment(`${year}-${month + 1}-01`, 'YYYY-MM-DD');
      const endOfMonth = startOfMonth.clone().endOf('month');

      if ((p.maxDate && this.isDayGreater(moment(p.maxDate, 'YYYY-MM-DD'), startOfMonth)) || !p.maxDate) {
        for (; index < balances.length; index++) {
          if (this.isDayGreaterOrEqual(balances[index].date, startOfMonth)) {
            break;
          }
        }

        let eomBalance: number = null;
        for (let i = index + 1; i < balances.length; i++) {
          if (this.isDayEqual(balances[i].date, endOfMonth)) {
            eomBalance = balances[i].balance;
            break;
          }
        }
        monthlyBalances.push({
          month: startOfMonth.format('YYYY-MM'),
          balance: index >= balances.length ? balances[balances.length - 1].balance : balances[index].balance,
          eomBalance
        });
      }
    });
    
    return monthlyBalances;
  }  
}
