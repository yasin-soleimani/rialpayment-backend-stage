import { Document } from 'mongoose';

export interface BasketProductOption extends Document {
  readonly basketProduct: string;
  readonly title: string;
  readonly status: boolean;
  readonly price: number;
}
