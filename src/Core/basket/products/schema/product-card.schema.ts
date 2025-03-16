import * as mongoose from 'mongoose';

export const BasketProductCardFieldSchema = new mongoose.Schema(
  {
    product: { type: mongoose.SchemaTypes.ObjectId, ref: 'BasketProductModel' },
    title: { type: String },
  },
  { timestamps: true }
);
