import * as momentjs from 'jalali-moment';

export const TaxiEntityIdGenerator = (counter: number): string => {
  const yearLastTwoDigits = momentjs().locale('fa').format('YYYY').slice(2);
  const favaSubsystemCode = process.env.FAVA_SUB_SYSTEM_CODE;
  const favaSystemCode = process.env.FAVA_SYSTEM_CODE;
  let prefixedCounter = counter.toString().padStart(12, '0');

  const finalEntityId = `${favaSubsystemCode}${favaSystemCode}${yearLastTwoDigits}${prefixedCounter}`;
  return finalEntityId;
};
