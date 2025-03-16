import { Document } from 'mongoose';
import { LeasingRefStatusEnum } from '../enums/leasing-ref-status.enum';
import { LeasingRefDecline } from './leasing-ref-decline.interface';
import { LeasingRefReforms } from './leasing-ref-reforms.interface';

export interface LeasingRef extends Document {
  readonly clubUser: any;
  readonly leasingUser: any;
  readonly status: LeasingRefStatusEnum;
  readonly declineReasons: LeasingRefDecline[];
  readonly show: boolean;
  readonly public: boolean;
  readonly reformsDescriptions: LeasingRefReforms[];
}
