# balance-growth

[![Build Status](https://travis-ci.org/rundef/node-balance-growth.svg?branch=master)](https://travis-ci.org/rundef/node-balance-growth)
[![Coverage Status](https://coveralls.io/repos/github/rundef/node-balance-growth/badge.svg?branch=master)](https://coveralls.io/github/rundef/node-balance-growth?branch=master)
[![Latest Stable Version](https://img.shields.io/npm/v/balance-growth.svg)](https://www.npmjs.com/package/balance-growth)

Calculate monthly balance growth over time.

## Installation

```bash
npm install balance-growth
```

## Getting start-of-month and end-of-month balances

> Transaction amounts are added after the last day of the month and before the first day of the following month.

```javascript
import {MonthlyBalanceAdjuster} from 'balance-growth';

const adjuster = new MonthlyBalanceAdjuster();
const balances = adjuster.getMonthlyBalances({
  balances: [
    { date: '2016-11-01', balance: 100 },
    { date: '2016-11-15', balance: 328 },
    { date: '2016-12-03', balance: 564 }
  ],
  transactions: [
    { date: '2016-11-02', amount: 200 },
    { date: '2016-12-02', amount: 200 }
  ],
  maxDate: '2017-01-01'
});
console.log(balances);
```

```json
[
  { 'month': '2016-11', 'balance': 100, 'eomBalance': 160 },
  { 'month': '2016-12', 'balance': 360, 'eomBalance': 364 }
]
```

## Getting balance growth (%) per month

```javascript
import {BalanceGrowth} from 'balance-growth';

const calculator = new BalanceGrowth();
const growth = calculator.getGrowth({
  balances: [
    { date: '2016-11-01', balance: 100 },
    { date: '2016-11-15', balance: 328 },
    { date: '2016-12-03', balance: 564 }
  ],
  transactions: [
    { date: '2016-11-02', amount: 200 },
    { date: '2016-12-02', amount: 200 }
  ],
  maxDate: '2017-01-01'
});
console.log(growth);
```

```json
[
  { 'month': '2016-11', 'balance': 100, 'eomBalance': 160, 'growth': 60 },
  { 'month': '2016-12', 'balance': 360, 'eomBalance': 364, 'growth': 1 }
]
```

> 60% growth in november and 1% growth in december

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.