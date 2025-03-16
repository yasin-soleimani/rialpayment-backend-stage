import * as mongoose from 'mongoose';

const MainInsuranceProduct = new mongoose.Schema(
  {
    title: { type: String },
    status: { type: Boolean, default: true },
    amount: { type: Number, required: true },
    id: { type: String },
    category: { type: mongoose.SchemaTypes.ObjectId, ref: 'MainInsuranceCategory' },
    company: { type: mongoose.SchemaTypes.ObjectId, ref: 'MainInsuranceCompany' },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

MainInsuranceProduct.virtual('details', {
  ref: 'MainInsuranceDetails',
  localField: '_id',
  foreignField: 'product',
  justOne: true,
});

export const MainInsuranceProductSchema = MainInsuranceProduct;
