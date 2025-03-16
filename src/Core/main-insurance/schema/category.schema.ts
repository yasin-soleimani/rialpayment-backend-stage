import * as mongoose from 'mongoose';

export const MainInsuranceCategorySchema = new mongoose.Schema(
  {
    title: { type: String },
    code: { type: Number },
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);
