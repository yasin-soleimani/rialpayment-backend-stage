import * as mongoose from 'mongoose';

export const PriceListDetailsSchema = new mongoose.Schema(
  {
    parent: { type: mongoose.Types.ObjectId, ref: 'Pricelist' },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
  },
  { timestamps: true }
);
