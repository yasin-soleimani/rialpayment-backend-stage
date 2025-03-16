import * as mongoose from 'mongoose';
const NationalInsuranceCompanySchema1 = new mongoose.Schema(
  {
    title: { type: String },
    terminal: { type: mongoose.SchemaTypes.ObjectId, ref: 'Mipg' },
    status: { type: Boolean, default: true },
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const NationalInsuranceCompanySchema = NationalInsuranceCompanySchema1;
