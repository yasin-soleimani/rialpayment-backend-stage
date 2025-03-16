import * as mongoose from 'mongoose';

export const IpgMplSchema = new mongoose.Schema(
  {
    mobile: { type: String },
    amount: { type: Number },
    terminal: { type: mongoose.SchemaTypes.ObjectId, ref: 'Mipg' },
  },
  { timestamps: true }
);
