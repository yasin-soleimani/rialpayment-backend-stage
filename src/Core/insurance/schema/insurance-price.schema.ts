import * as mongoose from 'mongoose';

const NationalInsurancePrice1 = new mongoose.Schema(
  {
    type: { type: Number, default: 1 },
    price: { type: Number },
    division: { type: Number },
    category: { type: mongoose.SchemaTypes.ObjectId, ref: 'NationalInsuranceCategory' },
  },
  { timestamps: true }
);

export const NationalInsurancePriceSchema = NationalInsurancePrice1;
