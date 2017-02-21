import {expect} from 'chai';
import {BalanceAdjuster} from '../../src/index';

const adjuster = new BalanceAdjuster();

describe('adjust -> without transactions', () => {
  it('end of month not set', () => {
    const balances = [
      { date: '2016-11-01', balance: 100 },
      { date: '2016-11-14', balance: 150 },
      { date: '2016-11-15', balance: 128 },
      { date: '2016-12-03', balance: 164 },
    ];
    expect(adjuster.adjust({ balances })).to.deep.equal([
      { month: '2016-11', startBalance: 100, endBalance: 160 },
      { month: '2016-12', startBalance: 160, endBalance: null },
    ]);
  });

  it('beginning of month not set', () => {
    const balances = [
      { date: '2016-11-05', balance: 108 },
      { date: '2016-12-01', balance: 160 },
    ];
    expect(adjuster.adjust({ balances })).to.deep.equal([
      { month: '2016-11', startBalance: 100, endBalance: 160 },
      { month: '2016-12', startBalance: 160, endBalance: null },
    ]);
  });

  it('beginning and end of month not set', () => {
    const balances = [
      { date: '2016-11-28', balance: 88 },
      { date: '2016-12-05', balance: 109 },
      { date: '2017-01-03', balance: 244 },
    ];
    expect(adjuster.adjust({ balances })).to.deep.equal([
      { month: '2016-11', startBalance: 7, endBalance: 97 },
      { month: '2016-12', startBalance: 97, endBalance: 235 },
      { month: '2017-01', startBalance: 235, endBalance: null },
    ]);
  });

  it('skipping 1 month', () => {
    const balances = [
      { date: '2016-11-28', balance: 1000 },
      { date: '2017-01-03', balance: 1360 },
    ];
    expect(adjuster.adjust({ balances })).to.deep.equal([
      { month: '2016-11', startBalance: 730, endBalance: 1030 },
      { month: '2016-12', startBalance: 1030, endBalance: 1340 },
      { month: '2017-01', startBalance: 1340, endBalance: null },
    ]);
  });

  it('skipping multiple months', () => {
    const balances = [
      { date: '2016-11-01', balance: 1000 },
      { date: '2017-03-11', balance: 2300 },
    ];
    expect(adjuster.adjust({ balances })).to.deep.equal([
      { month: '2016-11', startBalance: 1000, endBalance: 1300 },
      { month: '2016-12', startBalance: 1300, endBalance: 1610 },
      { month: '2017-01', startBalance: 1610, endBalance: 1920 },
      { month: '2017-02', startBalance: 1920, endBalance: 2200 },
      { month: '2017-03', startBalance: 2200, endBalance: null },
    ]);
  });
});
