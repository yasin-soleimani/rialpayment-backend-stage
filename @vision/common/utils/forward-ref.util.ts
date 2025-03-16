import { ForwardReference } from '@vision/common/interfaces/modules/forward-reference.interface';

export const forwardRef = (fn: () => any): ForwardReference => ({
  forwardRef: fn,
});
