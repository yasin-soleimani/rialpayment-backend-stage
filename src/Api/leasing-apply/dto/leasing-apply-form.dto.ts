export type DynamicPrefixedKeys<T extends string> = `${T}${string}`;

export type PrefixedLeasingFormKey = DynamicPrefixedKeys<'field'>;

export type LeasingApplyFormDto = {
  [K in PrefixedLeasingFormKey]: string;
};
