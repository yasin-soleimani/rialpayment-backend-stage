import * as mongoose from 'mongoose';
import * as uid from 'uniqid';

const PaymentSchema1 = new mongoose.Schema(
  {
    terminalid: { type: mongoose.SchemaTypes.ObjectId, ref: 'Mipg', required: true },
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User', required: true },
    amount: { type: mongoose.SchemaTypes.Number, required: true },
    payload: { type: mongoose.SchemaTypes.String },
    callbackurl: { type: mongoose.SchemaTypes.String, required: true },
    invoiceid: { type: mongoose.SchemaTypes.String, required: true },
    status: { type: mongoose.SchemaTypes.Number },
    iscredit: Boolean,
    type: { type: mongoose.SchemaTypes.Number },
    minvoiceid: { type: String },
    details: {
      rrn: Number,
      cardnumber: String,
      tracenumber: Number,
      digitalreceipt: String,
      datepaid: String,
      respcode: Number,
      respmsg: String,
      issuerbank: String,
      bankdiscount: Number,
      nonebankdiscount: Number,
      credit: Number,
      wage: Number,
    },
  },
  { timestamps: true }
);

class Pay {}
PaymentSchema1.loadClass(Pay);
PaymentSchema1.pre('save', function (this: Pay, next: any) {
  const doc: any = this;
  doc.minvoiceid = uid('Ipg-');
  next();
});
export const PaymentSchema = PaymentSchema1;
