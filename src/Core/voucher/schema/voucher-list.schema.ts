import * as mongoose from 'mongoose';

export const VoucherListSchema = new mongoose.Schema({
  title: { type: String },
  amount: { type: Number },
  discount: { type: Number },
  group: { type: mongoose.SchemaTypes.ObjectId, ref: 'GroupProject' },
  status: { type: Boolean, default: true },
});
