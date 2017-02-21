import * as moment from 'moment';
import {
  AdjustParams,
  BalanceInTime,
  TransactionInTime,
  MonthlyBalance
} from '../index.d';

export class BalanceAdjuster {
  public getGrowth(p: AdjustParams): MonthlyBalance[] {
    return null;
  }

  public adjust(p: AdjustParams): MonthlyBalance[] {
    if (p.transactions && p.transactions.length) {
      const adjustedBalances = this.getAdjustedBalances(p.balances, p.transactions);
      console.log('adjustedBalances ',adjustedBalances);
      return this.getAdjustedMonthlyBalances(adjustedBalances).map((e: any) => {
        e.month = moment(e.month, 'YYYY-MM-DD').format('YYYY-MM');
        return e
      });
    } else {
      return this.getAdjustedMonthlyBalances(p.balances).map((e: any) => {
        e.month = moment(e.month, 'YYYY-MM-DD').format('YYYY-MM');
        return e
      });
    }
  }

  public getAdjustedBalances(balances: BalanceInTime<string>[], _transactions: TransactionInTime<string>[]): BalanceInTime<string>[] {
    // Convert date to 'moment' objects
    const balancesInTime = balances.map((b: BalanceInTime<string>): BalanceInTime<moment.Moment> => {
      return {
        balance: b.balance,
        date: moment(b.date, 'YYYY-MM-DD')
      };
    });
    const transactions = _transactions.map((t: TransactionInTime<string>): TransactionInTime<moment.Moment> => {
      return {
        amount: t.amount,
        date: moment(t.date, 'YYYY-MM-DD')
      };
    });

    const transactionsPerMonth: any = {};
    for (const t of transactions) {
      for (let i = 0; i < balancesInTime.length; i++) {
        // Deduct transaction amount from balance where they are in the same month and balance.day >= transaction.day
        if (balancesInTime[i].date.year() === t.date.year() && balancesInTime[i].date.month() === t.date.month() &&
          balancesInTime[i].date.date() >= t.date.date()) {
          balancesInTime[i].balance += -1 * t.amount;
        }
      }
      
      // Keep a record of the transactions sum per month
      const month = t.date.format('YYYY-MM');
      transactionsPerMonth[month] = (transactionsPerMonth[month] || 0) + t.amount;
    }

    for (let i = 0; i < balancesInTime.length - 1; i++) {
      // if month in transactionsPerMonth ->
       // if lastDayOfMonth has no balance ->
    }


/*
    let transactionsThisMonth = 0;
    for (let i = 0; i < balancesInTime.length - 1; i++) {
      const currentBalance = balancesInTime[i];
      const nextBalance = balancesInTime[i + 1];

      // Loop over the transactions
      for (const t of transactions) {
        // Transaction occured between currentBalance and nextBalance
        if (t.date.isSameOrAfter(currentBalance.date) && t.date.isBefore(nextBalance.date)) {
          // currentBalance and nextBalance are in the same month
          if (t.date.isSame(currentBalance.date)) {
            currentBalance.balance += t.amount;
          }

          // We deduct the transaction amount from all the balances of the current month
          for (let j = i + 1; j < balancesInTime.length; j++) {
            const tmpBalance = balancesInTime[j];
            if (t.date.year() === tmpBalance.date.year() && t.date.month() === tmpBalance.date.month()) {
              tmpBalance.balance += t.amount;
            } else {
              break;
            }
          }
        }
      }


       
      //if (nextBalance && curBalance != SAME MONTH && curBalance != LAST DAY OF MONTH && transactions in the month of curBalance) {
      //  add adjustedBalance -> last day of month
      //  balance = firstBalanceOfMonth + (lastBalanceOfMonth - firstBalanceOfMonth)*(diff days [end of month - lastBalanceOfMonth]) - (sum_transactions)
      //}

      const endOfMonth = currentBalance.date.clone().endOf('month');
      if (currentBalance.date.month() !== nextBalance.date.month() &&
        !currentBalance.date.isSame(endOfMonth) &&
        true
        //transactionsThisMonth !== 0
      ) {
        // get previous balance && first balance of month
        balancesInTime.splice(i + 1, 0, {
          date: endOfMonth,
          balance: -5 //transactionsThisMonth + currentBalance.balance
        });
        i++;
      }
      //if (currentBalance.date.month() !== nextBalance.date.month() &&
      //nextBalance.date != THE FIRST && transactionsThisMonth !== 0

      //add date=startOfnextMonth balance=balanceEndOfLastMonth + transactionsThisMonth
    }
*/
    return balancesInTime.map((b: BalanceInTime<moment.Moment>): BalanceInTime<string> => {
      return {
        date: b.date.format('YYYY-MM-DD'),
        balance: b.balance,
      };
    });


  
/*
const balances = [
  { date: '2016-11-01', balance: 100 },
  { date: '2016-11-14', balance: 350 },
  { date: '2016-11-15', balance: 328 },
  { date: '2016-12-03', balance: 564 },
];
const transactions = [
  { date: '2016-11-02', amount: 200, type: 'in' },
  { date: '2016-12-02', amount: 200, type: 'in' },
];

ADJUSTED =>
  { date: '2016-11-01', balance: 100 },
  { date: '2016-11-14', balance: 150 },
  { date: '2016-11-15', balance: 128 },
  { date: '2016-11-30', balance: 160 },
  { date: '2016-12-01', balance: 360 },
  { date: '2016-12-03', balance: 364 },
ADJUSTED CURRENT =>

[ { date: '2016-11-01', balance: 100 },
  { date: '2016-11-14', balance: 150 },
  { date: '2016-11-15', balance: 128 },
  { date: '2016-11-30', balance: 128 },
  { date: '2016-12-03', balance: 364 } ]
*/
  }

  protected getMissingMonthBalances(date: moment.Moment, balance: number, previousDate: moment.Moment, previousBalance: number): MonthlyBalance[] {
    const missing: MonthlyBalance[] = [];
    const curDate = previousDate.clone().add({ months: 1 });

    // Loop over all the months between <previousDate> and <date>
    while (curDate.isBefore(date)) {
      const balanceDiff = balance - previousBalance;
      const dayDiff = date.diff(previousDate, 'days');
      const dayDiffCurDate = curDate.diff(previousDate, 'days');

      // Append starting balance for the missing month
      const newBalance: MonthlyBalance = {
        month: curDate.format('YYYY-MM-DD'),
        startBalance: Math.round(previousBalance + (balanceDiff / dayDiff) * (dayDiffCurDate)),
        endBalance: null
      };
      missing.push(newBalance);
      previousBalance = newBalance.startBalance;

      previousDate = curDate.clone();
      curDate.add({ months: 1 });
    }
    
    return missing;
  }

  protected getAdjustedMonthlyBalances(balancesInTime: BalanceInTime<string>[]): MonthlyBalance[] {
    let balancePerMonths: MonthlyBalance[] = [];
    let currentYear = null;
    let currentMonth = null;

    const setEndOfLastMonthBalance = (balance: number): void => {
      if (balancePerMonths.length) {
        balancePerMonths[balancePerMonths.length -1].endBalance = balance;
      }
    }

    // Loop over all the balances that we have
    for (let i = 0; i < balancesInTime.length; i = i + 1) {
      const currentBalance = balancesInTime[i];
      const date = moment(currentBalance.date);

      // If the current's balance month/year isn't the same at the previous one
      if ((currentYear === null && currentMonth === null) || date.year() !== currentYear || date.month() !== currentMonth) {
        // If the balance's date is not yyyy-mm-01
        if (date.date() !== 1) {
          let dayDiff = 0;
          let balanceDiff = 0;

          // Find avg growth per day between last balance and current balance
          if (i > 0) {
            balanceDiff = currentBalance.balance - balancesInTime[i - 1].balance;
            const lastDate = moment(balancesInTime[i - 1].date);
            dayDiff = date.diff(lastDate, 'days');
          // Find avg growth per day between current balance and next balance
          } else if (i === 0 && i < balancesInTime.length - 1) {
            balanceDiff = balancesInTime[i + 1].balance - currentBalance.balance;
            const nextDate = moment(balancesInTime[i + 1].date);
            dayDiff = nextDate.diff(date, 'days');
          }

          if (dayDiff > 0) {
            const firstDayOfMonth = date.clone().startOf('month');
            const dayDiffUntilFirst = date.diff(firstDayOfMonth, 'days');

            const curMonthBalance: MonthlyBalance = {
              month: firstDayOfMonth.format('YYYY-MM-DD'),
              startBalance: Math.round(currentBalance.balance - (balanceDiff / dayDiff) * dayDiffUntilFirst),
              endBalance: null
            };
            setEndOfLastMonthBalance(curMonthBalance.startBalance);
            // If at least 1 month with balance
            if (balancePerMonths.length > 0) {
              // Find months without balance
              const missing = this.getMissingMonthBalances(
                firstDayOfMonth,
                curMonthBalance.startBalance,
                moment(balancePerMonths[balancePerMonths.length -1].month),
                balancePerMonths[balancePerMonths.length -1].startBalance
              );
              if (missing.length) {
                // Set all of the endBalance = nextMonth.startBalance
                setEndOfLastMonthBalance(missing[0].startBalance);
                for (let j = 0; j + 1 < missing.length; j++) {
                  const tmpBalance = missing[j + 1].startBalance;
                  missing[j].endBalance = tmpBalance;
                }
                balancePerMonths = balancePerMonths.concat(missing);
                missing[missing.length - 1].endBalance = curMonthBalance.startBalance;
              }
            }
            balancePerMonths.push(curMonthBalance);
          }
        } else {
          // The balance's date is at yyyy-mm-01
          const curMonthBalance: MonthlyBalance = {
            month: currentBalance.date,
            startBalance: currentBalance.balance,
            endBalance: null
          };
          setEndOfLastMonthBalance(curMonthBalance.startBalance);
          balancePerMonths.push(curMonthBalance);
        }

        currentYear = date.year();
        currentMonth = date.month();
      }
    }

    return balancePerMonths;
  }
}
