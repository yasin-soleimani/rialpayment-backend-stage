import * as mongoose from 'mongoose';

export const CheckoutCurrentCheckoutSchema = new mongoose.Schema(
  {
    account: { type: mongoose.SchemaTypes.ObjectId, ref: 'CheckoutBankAccounts' },
    balance: { type: Number, default: 0 },
    date: { type: String, unique: true },
  },
  { timestamps: true }
);
