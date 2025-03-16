import { isEmpty } from '@vision/common/utils/shared.utils';

const roundTo = require('round-to');

export function BackofficeWebServiceNull() {
  return {
    count: 0,
    amount: 0,
  };
}

export function BackofficeDiscountCalc(data) {
  console.log(data);
  let company,
    agent,
    total,
    amount,
    wage = 0;
  company = roundTo(Math.round((60 * data.discount) / 100), 2);
  total = roundTo(data.total, 2);
  wage = roundTo(data.discount, 2);
  amount = roundTo(data.total - data.discount, 2);
  agent = roundTo(data.discount - company, 2);

  return {
    total: total || 0,
    amount: amount || 0,
    wage: wage || 0,
    agent: agent || 0,
    company: company || 0,
  };
}
