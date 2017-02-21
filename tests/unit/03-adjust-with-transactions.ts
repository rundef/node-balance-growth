import {expect} from 'chai';
import {BalanceAdjuster} from '../../src/index';

const adjuster = new BalanceAdjuster();

describe('adjust -> with transactions', () => {
  it('end of month not set', () => {
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
    expect(adjuster.adjust({ balances, transactions })).to.deep.equal([
      { month: '2016-11', startBalance: 100, endBalance: 160 },
      { month: '2016-12', startBalance: 360, endBalance: null },
    ]);
  });

  it('beginning of month not set', () => {
    const balances = [
      { date: '2016-11-05', balance: 108 },
      { date: '2016-12-01', balance: 660 },
    ];
    const transactions = [
      { date: '2016-11-02', amount: 200 },
      { date: '2016-11-28', amount: 500 },
    ];
    expect(adjuster.adjust({ balances, transactions })).to.deep.equal([
      { month: '2016-11', startBalance: 100, endBalance: 160 },
      { month: '2016-12', startBalance: 860, endBalance: null },
    ]);
  });

  it('beginning and end of month not set', () => {
    const balances = [
      { date: '2016-11-28', balance: 88 },
      { date: '2016-12-05', balance: 109 },
      { date: '2017-01-03', balance: 244 },
    ];
    const transactions = [
      { date: '2016-11-02', amount: 200 },
      { date: '2016-11-29', amount: 300 },
      { date: '2016-12-10', amount: -100 },
    ];
    expect(adjuster.adjust({ balances, transactions })).to.deep.equal([
      { month: '2016-11', startBalance: 7, endBalance: 97 },
      { month: '2016-12', startBalance: 597, endBalance: 735 },
      { month: '2017-01', startBalance: 635, endBalance: null },
    ]);
  });

  it('skipping 1 month', () => {

  });

  it('skipping multiple months', () => {

  });
});
