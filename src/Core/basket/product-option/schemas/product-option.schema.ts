import * as mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    basketProduct: { type: mongoose.Types.ObjectId, ref: 'BasketProduct', required: true },
    title: { type: String, required: true },
    status: { type: Boolean, default: true },
    price: { type: Number, required: true },
  },
  {
    id: false,
    timestamps: true,
  }
);

export const BasketProductOptionSchema = schema;
