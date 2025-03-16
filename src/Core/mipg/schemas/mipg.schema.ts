import * as mongoose from 'mongoose';
import { autoIncrement } from 'mongoose-plugin-autoinc';
import * as mongoosePaginate from 'mongoose-paginate';

const MipgSchema1 = new mongoose.Schema(
  {
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    status: { type: Boolean, default: true },
    url: { type: String },
    logo: { type: String },
    terminalid: { type: Number },
    terminal: { type: mongoose.SchemaTypes.ObjectId, ref: 'MerchantTerminal' },
    email: { type: String, required: true },
    ip: { type: String, required: true },
    ip2: { type: String, default: '' },
    ip3: { type: String, default: '' },
    ip4: { type: String, default: '' },
    ip5: { type: String, default: '' },
    karmozd: { type: Number, default: 0 },
    type: { type: Number, default: 1 },
    wagetype: { type: Number, default: 2 },
    psp: { type: String, default: 0 },
    isdirect: { type: Boolean, default: true },
    mrs: {
      terminalid: { type: String },
      acceptorid: { type: String },
      psp: { type: String },
    },
    ref: { type: mongoose.SchemaTypes.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

MipgSchema1.plugin(autoIncrement, {
  model: 'Mipg',
  field: 'terminalid',
  startAt: 2000000,
  incrementBy: 7,
});
MipgSchema1.plugin(mongoosePaginate);
MipgSchema1.virtual('auth', {
  ref: 'MipgAuth',
  localField: '_id',
  foreignField: 'mipg',
  justOne: true,
});

MipgSchema1.virtual('direct', {
  ref: 'MipgDirects',
  localField: '_id',
  foreignField: 'mipg',
});
MipgSchema1.virtual('voucher', {
  ref: 'MipgVoucher',
  localField: '_id',
  foreignField: 'mipg',
  justOne: true,
});
export const MipgSchema = MipgSchema1;
