import { isEmpty } from "@vision/common/utils/shared.utils";
const roundTo = require('round-to');

// discount calculator
export function discountCalc(amount: number, nonebank: number, bank: number, wage?: number)
{

  const totalPercent = nonebank + bank;
  const totalDiscount = Math.round(( (totalPercent * amount) / 100));
  let amountMod = amount - totalDiscount;
  let wageDisc = 15;

  const companyWage =  roundTo(( (wageDisc * totalPercent) / 100), 1);
// calc gheyrenaghdi
  const nonebankValue = Math.round(( (nonebank * amount) / 100));
// calc naghdi
  let bankpercent = 0;
  if ( bank <= 0 ) {
    bankpercent = 0;
  } else {
    bankpercent = bank - companyWage ;
  }
  const bankValue = Math.round(( (bankpercent * amount) / 100));

// calc company
  let merchantWage,cardWage,companyWageMod;
  let wageMod = Math.round(( (bank * amount) / 100)) - Math.round(( (bankpercent * amount) / 100));
  if ( wageMod <= 0 ) {
    const nonebankpercent = nonebank - companyWage;
    wageMod = Math.round(( (nonebank * amount) / 100)) - Math.round(( (nonebankpercent * amount) / 100));
    amountMod = amountMod - wageMod;
    totalDiscount + wageMod;
  }

  merchantWage = Math.round(( (35 * wageMod) / 100));
  cardWage = Math.round(( (15 * wageMod) / 100));
  companyWageMod = wageMod - ( merchantWage + cardWage );

  return {
    companywage : companyWageMod,
    cardref: cardWage,
    merchantref: merchantWage,
    nonebank: nonebankValue,
    bankdisc: bankValue,
    discount : totalDiscount,
    amount: amountMod,
  };

  // const totalPercent = nonebank + bank;
  // const totalDiscount = Math.round(( (totalPercent * amount) / 100));
  // const amountMod = amount - totalDiscount;
  // let wageDisc ;
  // if (isEmpty(wage)) { wageDisc = 15; } else { wageDisc = wage }
  //
  // const companyWage =  Math.round(( (wageDisc * totalPercent) / 100));
  // // calc naghdi
  // const nonebankpercent = nonebank - companyWage ;
  // const nonebankValue = Math.round(( (nonebankpercent * amount) / 100));
  // const nonebanktotalValue = amount - nonebankValue;
  //
  // //calc gheyrenaghdi
  // const bankValue = Math.round(( (nonebankpercent * amount) / 100));
  // const banktotalValue = amount - bankValue;

  // company wage calc

  //
  // // calc nonebank
  // const nonebankDiscount = Math.round(( (nonebank * amount) / 100));
  // const nonbankValue = Math.round(( (wageDisc * nonebankDiscount) / 100));
  // const nonBankTotal = nonbankx - nonbankValue;
  //
  //
  // const percent = nonebank + bank;
  // const discountx = Math.round(( (percent * amount) / 100));
  // const discount = amount - discountx;
  // // let wageDisc ;
  // // if (isEmpty(wage)) { wageDisc = 15; } else { wageDisc = wage }
  //
  // // calc nonbank
  // const nonbankx = Math.round(( (nonebank * amount) / 100));
  // const nonbankValue = Math.round(( (wageDisc * nonbankx) / 100));
  // const nonBankTotal = nonbankx - nonbankValue;
  //
  // // calc bank
  // const bankx = Math.round(( (bank * amount) / 100));
  // const bankValue = Math.round(( (wageDisc * bankx) / 100));
  // const bankTotal = bankx - bankValue;
  //
  // // calc company & card ref & merchant ref wage
  // const cowage = nonbankValue + bankValue;
  //
  // const companywage = cowage / 2;
  // const refwage = Math.round(( (70 * companywage) / 100));
  // const cardref = companywage - refwage;
  // const merchantref = refwage;

  // return {
  //   companywage : companywage,
  //   cardref: cardref,
  //   merchantref: merchantref,
  //   nonebank: nonBankTotal,
  //   bankdisc: bankTotal,
  //   discount : discountx,
  //   amount: discount,
  // };
}
