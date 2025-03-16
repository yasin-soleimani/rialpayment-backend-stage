import { Document } from 'mongoose';

export interface Taxi extends Document {
  readonly user: string;
  readonly paid: boolean;
  readonly amount: number;
  readonly entityId: string;
  readonly instituteId: number;
  readonly terminalID: number;
  readonly taxiInformation: string | any;
  readonly payInformation: string | any;
  readonly referrer: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
