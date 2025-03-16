import * as mongoose from 'mongoose';

export const MerchantPspFileSchema = new mongoose.Schema(
  {
    user: { type: String },
    merchant: { type: mongoose.Types.ObjectId, ref: 'MerchantPspCustomer' },
    img: { type: String },
    byte: { type: String },
    fileName: { type: String },
    status: { type: Boolean, default: true },
    type: { type: Number, default: 1 },
    fileType: {
      name: String,
      type: { type: Number },
    },
    savedId: { type: String },
  },
  { timestamps: true }
);
