import * as mongoose from 'mongoose';

export const MainInsuranceCompanySchema = new mongoose.Schema(
  {
    title: { type: String },
    logo: { type: String },
  },
  { timestamps: true }
);
