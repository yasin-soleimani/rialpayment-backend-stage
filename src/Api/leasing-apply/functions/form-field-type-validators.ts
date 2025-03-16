import { LeasingFormTypeEnum } from '../../../Core/leasing-form/enums/leasing-form-type.enum';

type LeasingFormFieldTypeValidator = Partial<Record<LeasingFormTypeEnum, (value: string) => boolean>>;

const nationalcodeValidator = (value: string): boolean => {
  let temp = '';
  const inputLength = value.length;

  if (inputLength < 8 || parseInt(value, 10) === 0) return false;
  temp = ('0000' + value).substring(inputLength + 4 - 10);

  if (parseInt(temp.substring(3, 10), 10) == 0) return false;

  const controllerDigit = parseInt(temp.substring(9, 10), 10);
  let sum = 0;
  for (var i = 0; i < 9; i++) {
    sum += parseInt(temp.substring(i, i + 1), 10) * (10 - i);
  }

  const remain = sum % 11;

  return (remain < 2 && controllerDigit == remain) || (remain >= 2 && controllerDigit == 11 - remain);
};

export const leasingFormFieldTypeValidators: LeasingFormFieldTypeValidator = {
  email: (value: string) => {
    if (!value) return true;
    return new RegExp(/^([\w-\.]+@(?!lsu.edu)([\w-]+\.)+[\w-]{2,4})?$/).test(value);
  },
  nationalcode: (value: string) => {
    if (!value) return true;
    return nationalcodeValidator(value);
  },
  mobile: (value: string) => {
    if (!value) return true;
    return new RegExp(/^(090|091|092|093|094|099).{8}$/).test(value);
  },
  text: (value: string) => {
    return true;
  },
};
