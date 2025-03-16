import * as mongoose from 'mongoose';

export const VoucherSchema = new mongoose.Schema(
  {
    amount: Number,
    discount: { type: Number, default: 0 },
    totalamount: { type: Number },
    percent: { type: Number, default: 0 },
    by: { type: mongoose.Types.ObjectId, ref: 'User' },
    mobile: Number,
    hek: String,
    hmac: String,
    expire: { type: String },
    type: Number,
    data: String,
    ref: String,
    serial: String,
  },
  { timestamps: true }
);
