import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';
import * as uid from 'uniqid';
import * as mongooseAggregatePaginate from 'mongoose-aggregate-paginate';

const IpgSchema1 = new mongoose.Schema(
  {
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    mobile: { type: mongoose.SchemaTypes.Number },
    ref: { type: String },
    amount: { type: Number },
    token: { type: String },
    paytype: { type: Number, default: 1 },
    wagetype: { type: Number, default: 1 },
    karmozd: { type: Number, default: 0 },
    confirm: { type: Boolean, default: false },
    reverse: { type: Boolean, default: false },
    cardnumber: { type: String },
    total: Number,
    discount: Number,
    type: { type: Number },
    orderid: { type: String },
    terminalid: { type: Number },
    callbackurl: { type: String },
    invoiceid: { type: String },
    userinvoice: { type: String },
    payload: { type: String },
    status: { type: Number },
    devicetype: { type: String },
    trx: { type: Boolean, default: false },
    launch: { type: Boolean, default: false },
    direct: { type: Boolean, default: false },
    isdirect: { type: Boolean, default: true },
    pardakhtyari: { type: Boolean, default: false },
    auth: { type: Boolean, default: false },
    ip: { type: String },
    authcode: { type: String },
    authinfo: {
      birthdate: { type: String },
      nationalcode: { type: String },
      mobile: { type: String },
      cardnumber: { type: String },
    },
    tmp: { type: String },
    terminalinfo: {
      loginaccount: { type: String },
      acceptorcode: { type: String },
      terminal: { type: String },
      sheba: { type: String },
      mid: { type: String },
      key: { type: String },
      iv: { type: String },
      merchantconfigid: { type: String },
      merchant: { type: String },
      username: { type: String },
      password: { type: String },
    },
    retry: { type: Number, default: 0 },
    details: {
      rrn: Number,
      cardnumber: String,
      tracenumber: Number,
      digitalreceipt: String,
      datepaid: String,
      respcode: Number,
      respmsg: String,
      refnum: String,
      issuerbank: String,
      type: { type: Number, default: 1 },
      respcontent: String,
    },
  },
  { timestamps: true }
);
IpgSchema1.pre('save', function (this: Ipg, next: any) {
  const doc: any = this;
  doc.ref = uid();
  next();
});

class Ipg {}
IpgSchema1.loadClass(Ipg);
IpgSchema1.plugin(mongoosePaginate);
IpgSchema1.plugin(mongooseAggregatePaginate);
export const IpgSchema = IpgSchema1;
