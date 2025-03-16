import * as mongoose from 'mongoose';

export const ShabacoreSchema = new mongoose.Schema(
  {
    bankname: { type: String },
    shaba: { type: String },
  },
  { timestamps: true }
);
