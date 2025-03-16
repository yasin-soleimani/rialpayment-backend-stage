import * as mongoose from 'mongoose';

export const CheckoutSchema = new mongoose.Schema(
  {
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    account: { type: String, required: true, unique: true },
    bankname: { type: String, required: true },
    bankcode: { type: Number, default: 1, required: true },
    type: { type: Number },
  },
  { timestamps: true }
);
