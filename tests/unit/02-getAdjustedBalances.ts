import {expect} from 'chai';
import {BalanceAdjuster} from '../../src/index';

const adjuster = new BalanceAdjuster();

describe('getAdjustedBalances', () => {
  it('add start/end of month', () => {
    const balances = [
      { date: '2016-11-01', balance: 100 },
      { date: '2016-11-14', balance: 350 },
      { date: '2016-11-15', balance: 328 },
      { date: '2016-12-03', balance: 564 },
    ];
    const transactions = [
      { date: '2016-11-02', amount: 200 },
      { date: '2016-12-02', amount: 200 },
    ];
    console.log(adjuster.getAdjustedBalances(balances, transactions))
    expect(adjuster.getAdjustedBalances(balances, transactions)).to.deep.equal([
      { date: '2016-11-01', balance: 100 },
      { date: '2016-11-14', balance: 150 },
      { date: '2016-11-15', balance: 128 },
      { date: '2016-11-30', balance: 160 },
      { date: '2016-12-01', balance: 360 },
      { date: '2016-12-03', balance: 364 },
    ]);
  });
});
