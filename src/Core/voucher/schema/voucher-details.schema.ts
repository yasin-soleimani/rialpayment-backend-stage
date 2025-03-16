import * as mongoose from 'mongoose';

export const VoucherDetailsSchema = new mongoose.Schema({
  voucher: { type: mongoose.SchemaTypes.ObjectId, ref: 'VoucherModel' },
  item: [
    {
      product: { type: mongoose.SchemaTypes.ObjectId, ref: 'VoucherList' },
      qty: { type: Number },
      amount: { type: Number },
      discount: { type: Number },
      total: { type: Number },
      used: { type: Boolean, default: false },
    },
  ],
  total: { type: Number },
  qty: { type: Number },
  status: { type: Boolean, default: false },
});
