import { Document } from 'mongoose';

export interface BasketDeliveryTime extends Document {
  readonly basketStore: string;
  readonly day: number;
  readonly status: boolean;
  readonly startTime: string;
  readonly endTime: string;
  readonly capacity: number;
}
