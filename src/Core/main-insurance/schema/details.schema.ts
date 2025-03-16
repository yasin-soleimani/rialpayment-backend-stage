import * as mongoose from 'mongoose';

export const MainInsuranceDetailsSchema = new mongoose.Schema(
  {
    product: { type: mongoose.SchemaTypes.ObjectId, ref: 'MainInsuranceProduct' },
    details: [
      {
        title: { type: String },
        amount: { type: Number },
      },
    ],
  },
  { timestamps: true }
);
