import * as mongoose from 'mongoose';

const NationalInsuranceCategorySchema1 = new mongoose.Schema(
  {
    title: { type: String },
    logo: { type: String },
    code: { type: Number },
    company: { type: mongoose.SchemaTypes.ObjectId, ref: 'NationalInsuranceCompany' },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

NationalInsuranceCategorySchema1.virtual('details', {
  ref: 'NationalInsurancePrice',
  localField: '_id',
  foreignField: 'category',
  justOne: true,
});

export const NationalInsuranceCategorySchema = NationalInsuranceCategorySchema1;
