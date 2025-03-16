import { InternalServerErrorException } from '@vision/common';

export function OrganizationPoolRemainFunc(last: any, amount: number) {
  if (last) {
    return last.remain + amount;
  } else {
    return amount;
  }
}

export function OrganizationPoolInOutFunc(input: number, out: number) {
  if (input == 0) return { input: 0, out, amount: out };
  if (out == 0) return { input, out: 0, amount: input };
  throw new InternalServerErrorException();
}
