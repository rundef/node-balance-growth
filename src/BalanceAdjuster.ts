import * as moment from 'moment';
import {Params, BalanceInTime, TransactionInTime} from '../index.d';

export class BalanceAdjuster {
  protected isDayEqual(d1: moment.Moment, d2: moment.Moment): boolean {
    if (d1.year() === d2.year()) {
      if (d1.month() === d2.month()) {
        return (d1.date() === d2.date());
      }
    }
    return false;
  }

  protected isDayGreater(d1: moment.Moment, d2: moment.Moment): boolean {
    if (d1.year() === d2.year()) {
      if (d1.month() === d2.month()) {
        return (d1.date() > d2.date());
      }
      return (d1.month() > d2.month());
    }
    return (d1.year() > d2.year());
  }

  protected isDayGreaterOrEqual(d1: moment.Moment, d2: moment.Moment): boolean {
    if (d1.year() === d2.year()) {
      if (d1.month() === d2.month()) {
        return (d1.date() >= d2.date());
      }
      return (d1.month() > d2.month());
    }
    return (d1.year() > d2.year());
  }

  protected isDayLessThan(d1: moment.Moment, d2: moment.Moment): boolean {
    if (d1.year() === d2.year()) {
      if (d1.month() === d2.month()) {
        return (d1.date() < d2.date());
      }
      return (d1.month() < d2.month());
    }
    return (d1.year() < d2.year());
  }

  protected isMonthGreaterOrEqual(d1: moment.Moment, d2: moment.Moment): boolean {
    if (d1.year() === d2.year()) {
      return (d1.month() >= d2.month());
    }
    return (d1.year() > d2.year());
  }

  protected isMonthLessThan(d1: moment.Moment, d2: moment.Moment): boolean {
    if (d1.year() === d2.year()) {
      return (d1.month() < d2.month());
    }
    return (d1.year() < d2.year());
  }

  protected loopEachMonth(balances: BalanceInTime<moment.Moment>[], maxDate: string, handler: Function): void {
    let firstYear = balances[0].date.year();
    let firstMonth = balances[0].date.month();
    let lastYear = balances[balances.length - 1].date.year();
    let lastMonth = balances[balances.length - 1].date.month();

    if (maxDate) {
      const tmp = moment(maxDate, 'YYYY-MM-DD');
      lastYear = tmp.year();
      lastMonth = tmp.month();
    }

    if (firstYear === lastYear) {
      while (firstMonth <= lastMonth) {
        handler(firstYear, firstMonth++);
      }
    } else {
      while (firstYear <= lastYear) {
        while (firstMonth < 12) {
          if (firstYear === lastYear && firstMonth > lastMonth) {
            break;
          }
          handler(firstYear, firstMonth++);
        }

        firstYear++;
        firstMonth = 0;
      }
    }
  }

  protected getTransactionsAmount(
    minDate: moment.Moment,
    maxDate: moment.Moment,
    transactions: TransactionInTime<moment.Moment>[],
  ): number {
    const filteredTransactions = transactions.filter((t: TransactionInTime<moment.Moment>) => {
      return this.isDayGreaterOrEqual(t.date, minDate) && this.isDayGreater(maxDate, t.date);
    });

    if (filteredTransactions.length === 1) {
      return filteredTransactions[0].amount;
    } else if (filteredTransactions.length > 1) {
      return <number> filteredTransactions.reduce((prev: number, current: TransactionInTime<moment.Moment>) => {
        return prev + current.amount;
      }, 0);
    }

    return 0;
  }

  protected getBalanceForDate(
    date: moment.Moment,
    balances: BalanceInTime<moment.Moment>[],
    transactions: TransactionInTime<moment.Moment>[],
    index: number
  ): BalanceInTime<moment.Moment> {
    let curBalance = balances[index].balance;
    let transactionsMinDate = balances[index - 1].date.clone();
    if (balances[index].date.date() == 1) {
      transactionsMinDate = date.clone().startOf('month');      
    }

    curBalance -= this.getTransactionsAmount(transactionsMinDate, balances[index].date, transactions);
   
    const prevBalance = balances[index - 1].balance;
    let balanceDiff = curBalance - prevBalance;

    const dayDiffPrev = balances[index].date.diff(balances[index - 1].date, 'days');
    const dayDiff = date.diff(balances[index - 1].date, 'days');

    return {
      date,
      balance: Math.round(balances[index - 1].balance + (dayDiff * (balanceDiff / dayDiffPrev))),
      eodBalance: Math.round(balances[index - 1].balance + ((dayDiff + 1) * (balanceDiff / dayDiffPrev)))
    };
  }

  public getAdjustedBalances(p: Params<string>): BalanceInTime<string>[] {
    // Convert date to 'moment' objects
    const balances = p.balances.map((b: BalanceInTime<string>): BalanceInTime<moment.Moment> => {
      return {
        balance: b.balance,
        date: moment(b.date, 'YYYY-MM-DD')
      };
    });
    const transactions = (p.transactions || []).map((t: TransactionInTime<string>): TransactionInTime<moment.Moment> => {
      return {
        amount: t.amount,
        date: moment(t.date, 'YYYY-MM-DD')
      };
    });

    const transactionsPerMonth: any = {};
    for (const t of transactions) {
      for (const b of balances) {
        // Deduct transaction amount from balance if they are in the same month and balance.day >= transaction.day
        if (b.date.year() === t.date.year() &&
          b.date.month() === t.date.month() &&
          b.date.date() >= t.date.date()) {
          b.balance += -1 * t.amount;
        }
      }
      
      // Keep a record of the transactions sum per month
      const month = t.date.format('YYYY-MM');
      transactionsPerMonth[month] = (transactionsPerMonth[month] || 0) + t.amount;
    }

    let index = 0;
    this.loopEachMonth(balances, p.maxDate, (year: number, month: number): void => {
      const startOfMonth = moment(`${year}-${month + 1}-01`, 'YYYY-MM-DD');
      const endOfLastMonth = startOfMonth.clone().subtract({ month: 1 }).endOf('month');

      for (; index < balances.length; index++) {
        if (this.isDayGreaterOrEqual(balances[index].date, startOfMonth)) {
          break;
        }
      }

      // Add balance for the last day of the previous month
      if (index >= balances.length) {
        balances.splice(index, 0, {
          date: endOfLastMonth,
          balance: balances[balances.length - 1].eodBalance || balances[balances.length - 1].balance
        });
        index++;
      } else if (!this.isDayEqual(balances[index].date, endOfLastMonth)) {
        if (index >= 1) {
          const balance = this.getBalanceForDate(endOfLastMonth, balances, transactions, index);
          balances.splice(index, 0, balance);
          index++;
        }
      }

      // Add balance for the first day of the month
      if ((p.maxDate && this.isDayGreater(moment(p.maxDate, 'YYYY-MM-DD'), startOfMonth)) || !p.maxDate) {
        if (index >= balances.length) {
          balances.splice(index, 0, {
            date: startOfMonth,
            balance: (balances[balances.length - 1].eodBalance || balances[balances.length - 1].balance) +
               (transactionsPerMonth[endOfLastMonth.format('YYYY-MM')] || 0)
          });
          index++;
        } else if (!this.isDayEqual(balances[index].date, startOfMonth)) {
          if (index > 1) {
            balances.splice(index, 0, {
              date: startOfMonth,
              balance: balances[index - 1].eodBalance + (transactionsPerMonth[endOfLastMonth.format('YYYY-MM')] || 0)
            });
            index++;
          } else if (index === 0) {
            balances.splice(index, 0, {
              date: startOfMonth,
              balance: Math.round(balances[index].balance),
            });
            index++;
          } else if (index < balances.length - 1) {
            const transactionAmount = this.getTransactionsAmount(balances[index].date.clone().startOf('month'), balances[index + 1].date, transactions);

            const balanceDiff = (balances[index + 1].balance - balances[index].balance) + (-1 * transactionAmount);
            const dayDiffNext = balances[index + 1].date.diff(balances[index].date, 'days');
            const dayDiff = balances[index].date.diff(startOfMonth, 'days');

            balances.splice(index, 0, {
              date: startOfMonth,
              balance: Math.round(balances[index].balance - (balanceDiff / dayDiffNext * dayDiff)),
            });
            index++;
          }
        }
      }
    });

    return balances.map((b: BalanceInTime<moment.Moment>): BalanceInTime<string> => {
      const b2: BalanceInTime<string> = {
        date: b.date.format('YYYY-MM-DD'),
        balance: b.balance
      }
      if (b.eodBalance !== undefined) {
        b2.eodBalance = b.eodBalance;
      }
      return b2;
    });
  }
}
