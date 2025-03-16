import * as mongoose from 'mongoose';

export const IpgListSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    status: { type: Boolean, default: true },
    code: { type: Number, default: 0 },
  },
  { timestamps: true }
);
