import * as mongoose from 'mongoose';

export const MipgVoucherSchema = new mongoose.Schema({
  mipg: { type: mongoose.SchemaTypes.ObjectId, ref: 'Mipg' },
  status: { type: Boolean, default: false },
  karmozd: { type: Number, default: 0 },
  type: { type: Number, default: 1 },
});
