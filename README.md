# adjust-balance

[![Build Status](https://travis-ci.org/rundef/node-adjust-balance.svg?branch=master)](https://travis-ci.org/rundef/node-adjust-balance)
[![Coverage Status](https://coveralls.io/repos/github/rundef/node-adjust-balance/badge.svg?branch=master)](https://coveralls.io/github/rundef/node-adjust-balance?branch=master)
[![Latest Stable Version](https://img.shields.io/npm/v/adjust-balance.svg)](https://www.npmjs.com/package/adjust-balance)
[![Known Vulnerabilities](https://snyk.io/test/npm/adjust-balance/badge.svg)](https://snyk.io/test/npm/adjust-balance)

Flexible scheduler to find free time slots in the schedule of a resource (which could be a person, a meeting room, a car, etc...)

**sscheduler** can also intersect the availability of multiple resources in order to find the time slots at which all the resources are available.

## Installation

```bash
npm install adjust-balance
```

## Basic usage

```javascript
import {BalanceAdjuster} from 'adjust-balance';

const adjuster = new BalanceAdjuster();
const balances = adjuster.adjust({
  balances: [
    { date: '2016-11-01', balance: 100 },
    { date: '2016-11-14', balance: 350 },
    { date: '2016-11-15', balance: 328 },
    { date: '2016-12-03', balance: 564 }
  ],
  transactions: [
    { date: '2016-11-02', amount: 200, isDeposit: true },
    { date: '2016-12-02', amount: 200, isDeposit: true }
  ]
});
console.log(balances);
```

```json
[
  { month: '2016-11', startBalance: 100, endBalance: 160 },
  { month: '2016-12', startBalance: 360, endBalance: 422 }
]
```

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.