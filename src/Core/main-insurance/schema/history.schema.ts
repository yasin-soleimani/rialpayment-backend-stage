import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';
import { autoIncrement } from 'mongoose-plugin-autoinc';

const MainInsuranceHistory = new mongoose.Schema({
  transid: { type: Number },
  mobile: { type: String },
  fname: { type: String },
  lname: { type: String },
  father: { type: String },
  shenasno: { type: String },
  nationalcode: { type: String },
  byear: { type: Number },
  bmonth: { type: Number },
  bday: { type: Number },
  postalcode: { type: Number },
  sex: { type: Number },
  product: { type: mongoose.SchemaTypes.ObjectId, ref: 'MainInsuranceProduct' },
  mso: { type: Number },
  startdate: { type: Date },
  companycode: { type: Number },
  status: { type: Boolean, ref: 'false' },
  ref: { type: String },
  bno: { type: String },
  link: { type: String },
  type: { type: Number },
});

MainInsuranceHistory.plugin(autoIncrement, {
  model: 'MainInsuranceHistory',
  field: 'transid',
  startAt: 301000000000001,
  incrementBy: 1,
});
export const MainInsuranceHistorySchema = MainInsuranceHistory;
