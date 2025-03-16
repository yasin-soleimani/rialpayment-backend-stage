import * as mongoose from 'mongoose';
import * as securePin from 'secure-pin/index';
import * as mongoosePaginate from 'mongoose-aggregate-paginate';
import * as uid from 'uniqid';

const SafeVoucherSchema1 = new mongoose.Schema(
  {
    amount: { type: Number, default: 0 },
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    id: { type: String, unique: true },
    pin: { type: String, required: true },
    key: { type: String },
    type: { type: Number, default: 1 },
    expire: { type: String },
    mod: { type: Number },
    to: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    details: [
      {
        user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
        amount: Number,
        date: Date,
      },
    ],
  },
  { timestamps: true }
);

class Voucher {}
SafeVoucherSchema1.loadClass(Voucher);
// pre save options
SafeVoucherSchema1.pre('save', function (this: Voucher, next: any) {
  const doc: any = this;
  doc.key = securePin.generatePinSync(4);
  doc.id = uid('SV-');
  next();
});

SafeVoucherSchema1.plugin(mongoosePaginate);

export const SafeVoucherSchema = SafeVoucherSchema1;
