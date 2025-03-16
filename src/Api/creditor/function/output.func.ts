import { discountChangable } from '@vision/common/utils/load-package.util';

export function CreditorApiOutput(name, groups, debt, credit) {
  return {
    name: name,
    groups: groups,
    debt: debt,
    credit: credit,
  };
}

export function CreditorApiCalcPercent(groups, percent) {
  let total = 0;

  for (const info of groups) {
    total += info.first.amount;
  }
  return discountChangable(total, percent).discount;
}
