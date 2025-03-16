import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';

const NationalInsuranceSchema1 = new mongoose.Schema(
  {
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'National' },
    total: { type: Number },
    qty: { type: Number },
    company: { type: mongoose.SchemaTypes.ObjectId, ref: 'NationalInsuranceCompany' },
    category: { type: mongoose.SchemaTypes.ObjectId, ref: 'NationalInsuranceCategory' },
    invoiceid: { type: String },
    paid: { type: Boolean, default: false },
    ipg: { type: mongoose.SchemaTypes.ObjectId, ref: 'Ipg' },
    delete: { type: Boolean, default: false },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

NationalInsuranceSchema1.virtual('persons', {
  ref: 'NationalInsurancePerson',
  localField: '_id',
  foreignField: 'insurance',
});
NationalInsuranceSchema1.plugin(mongoosePaginate);

export const NationalInsuranceSchema = NationalInsuranceSchema1;
