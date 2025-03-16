const roundTo = require('round-to');
export function InvoiceBillingDetailsFunc(data) {
  const companywage = Math.floor((data.wage * 60) / 100);
  const agentwage = data.wage - companywage;

  const pureCompanyWage = Math.floor((companywage * 100) / 109);

  const tax = Math.ceil((pureCompanyWage * 9) / 100);

  return {
    companywage: pureCompanyWage,
    agentwage,
    tax,
  };
}

export function InvoiceBillingPosDetailsFunc(companywage, agentwage) {
  const pureCompanyWage = Math.floor((companywage * 100) / 109);
  const tax = Math.ceil((pureCompanyWage * 9) / 100);

  return {
    companywage: pureCompanyWage,
    agentwage,
    tax,
  };
}

export function InvoiceBillingClubDetailsFunc(companywage) {
  const pureCompanyWage = Math.floor((companywage * 100) / 109);
  const tax = Math.ceil((pureCompanyWage * 9) / 100);
  const total = Math.floor((companywage * 100) / 60);
  return {
    companywage: pureCompanyWage,
    agentwage: total - companywage,
    tax,
    total: total,
  };
}

export function InvoiceBillingPercentCalc(totalAmount, TotalWage) {
  if (totalAmount > 0) {
    return roundTo((TotalWage * 100) / totalAmount, 2);
  } else {
    return 0;
  }
}

export function InvoiceBillingWagePercentCalc(totalWage, qty) {
  return Math.floor(totalWage / qty);
}
