import { LeasingRefDecline } from '../../leasing-ref/interfaces/leasing-ref-decline.interface';

export interface LeasingApplyDecline extends Omit<LeasingRefDecline, 'rejectedBy'> {}
