import * as mongoose from 'mongoose';

const NationalInsurancePersonsSchema = new mongoose.Schema({
  firstname: { type: String },
  lastname: { type: String },
  birthdate: { type: Date },
  visatype: { type: Number },
  passportid: { type: String },
  amayeshid: { type: String },
  residencetype: { type: String },
  otherresidencetype: { type: String },
  visaexpire: { type: Date },
  economiccode: { type: String },
  job: { type: String },
  education: { type: String },
  tel: { type: String },
  relation: { type: Number, default: 3 },
  mobile: { type: String },
  insurance: { type: mongoose.SchemaTypes.ObjectId, ref: 'NationalInsurance' },
});

export const NationalInsurancePersonSchema = NationalInsurancePersonsSchema;
