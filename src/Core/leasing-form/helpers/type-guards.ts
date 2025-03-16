import { LeasingApplyFormDto, PrefixedLeasingFormKey } from '../../../Api/leasing-apply/dto/leasing-apply-form.dto';

export const isValidLeasingApplyFormField = (key: string): key is PrefixedLeasingFormKey => {
  return new RegExp(/^field\d+/).test(key);
};

export const isValidLeasingApplyForm = (obj: any): obj is LeasingApplyFormDto => {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const element = obj[key];
      if (!isValidLeasingApplyFormField(key)) {
        return false;
      }
    }
  }

  return true;
};
