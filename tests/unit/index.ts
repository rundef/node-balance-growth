import {expect} from 'chai';
import {BalanceAdjuster, MonthlyBalanceAdjuster, BalanceGrowth} from '../../src/index';
import * as fs from 'fs';
import * as path from 'path';

const balanceAdjuster = new BalanceAdjuster();
const monthlyBalanceAdjuster = new MonthlyBalanceAdjuster();
const balanceGrowth = new BalanceGrowth();

const fileExists = (p: string): boolean => {
  try {
    return fs.lstatSync(p).isFile();
  } catch (err) {
    return false;
  }
};

const runTest = (inputFilename: string, expectedFilename: string, testFunction: Function): void => {
  const input = JSON.parse(fs.readFileSync(inputFilename).toString());
  const expected = JSON.parse(fs.readFileSync(expectedFilename).toString());

  const response = testFunction(input);
  expect(response).to.deep.equal(expected);
};

const runTests = (testName: string, folderName: string, testFunction: Function): void => {
  describe(testName, () => {
    const dataPath = path.resolve(__dirname, `json/${folderName}`);

    for (let i = 1; i < 100; i = i + 1) {
      const no = (i >= 10 ? `${i}` : `0${i}`);
      if (fileExists(path.resolve(dataPath, `input${no}.json`))) {
        it(`test #${no}`, () => {
          runTest(
            path.resolve(dataPath, `input${no}.json`),
            path.resolve(dataPath, `expected${no}.json`),
            testFunction
          );
        });
      } else {
        break;
      }
    }
  });
};

const testGroups = {
  getAdjustedBalances: '01-adjusted-balances',
};

describe('balance-growth', () => {
  runTests('getAdjustedBalances', '01-adjusted-balances', balanceAdjuster.getAdjustedBalances.bind(balanceAdjuster));
  runTests('getMonthlyBalances (without transactions)', '02-monthly-balances-no-transactions', monthlyBalanceAdjuster.getMonthlyBalances.bind(monthlyBalanceAdjuster));
  runTests('getMonthlyBalances (with transactions)', '03-monthly-balances-transactions', monthlyBalanceAdjuster.getMonthlyBalances.bind(monthlyBalanceAdjuster));
  runTests('getGrowth', '04-growth', balanceGrowth.getGrowth.bind(balanceGrowth));
});
