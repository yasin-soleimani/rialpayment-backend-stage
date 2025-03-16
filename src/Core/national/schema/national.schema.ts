import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';

const NationalSchema1 = new mongoose.Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    father: { type: String, required: true },
    sex: { type: Number, required: true },
    marriage: { type: Number, required: true },
    birthdate: { type: Date, required: true },
    place: { type: String, required: true },
    visatype: { type: Number, required: true },
    passport: { type: String },
    amayesh: { type: String },
    residencetype: { type: Number }, // type of visa
    otherresidencetype: { type: Number },
    visaexpire: { type: Date },
    economiccode: { type: String },
    job: { type: String },
    education: { type: String },
    familymembersno: { type: Number },
    tel: { type: Number },
    mobile: { type: String },
    address: { type: String },
    postalcode: { type: Number },
    delete: { type: Boolean, default: false },
    ref: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    status: { type: Number, default: 1 },
    idcode: { type: String },
    sheba: { type: String },
    familycode: { type: String },
    description: [{ date: Date, desc: { type: String } }],
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

NationalSchema1.virtual('docs', {
  ref: 'NationalDocs',
  localField: '_id',
  foreignField: 'user',
});

NationalSchema1.plugin(mongoosePaginate);
export const NationalSchema = NationalSchema1;
