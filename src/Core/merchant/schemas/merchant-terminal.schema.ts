import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';
import * as mongooseAggregatePaginate from 'mongoose-aggregate-paginate';

const TerminalCoreSchema1 = new mongoose.Schema(
  {
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    merchant: { type: mongoose.SchemaTypes.ObjectId, ref: 'Merchant', index: true },
    title: { type: String },
    address: { type: String, required: true },
    province: { type: String },
    city: { type: String },
    mobile: { type: String },
    tell: { type: Number },
    terminalid: { type: Number, default: 0, index: true },
    status: { type: Boolean, default: true },
    sheba: { type: String },
    cosheba: { type: String },
    point: { type: Number, default: 0 },
    discbank: Number,
    discnonebank: Number,
    wage: { type: Number, default: 15 },
    type: { type: Number },
    isdiscount: { type: Boolean, default: true },
    iscredit: { type: Boolean, default: false },
    isinternet: { type: Boolean, default: false },
    ismozarebe: { type: Boolean, default: false },
    isinstallments: { type: Boolean, default: false },
    isinstallmentsCredit: { type: Boolean, default: false },
    club: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'User' }],
    rate: { type: Number, default: 0 },
    visit: { type: Number, default: 0 },
    visible: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

TerminalCoreSchema1.index({ merchant: 1, terminalid: 1 }, { unique: true });

TerminalCoreSchema1.virtual('strategy', {
  ref: 'MerchantStrategy',
  localField: '_id',
  foreignField: 'terminal',
});

TerminalCoreSchema1.virtual('credit', {
  ref: 'MerchantCredit',
  localField: '_id',
  foreignField: 'terminal',
});

TerminalCoreSchema1.virtual('pos', {
  ref: 'MerchantTerminalPosInfo',
  localField: '_id',
  foreignField: 'terminal',
});

TerminalCoreSchema1.plugin(mongoosePaginate);
TerminalCoreSchema1.plugin(mongooseAggregatePaginate);

export const MerchantTerminalCoreSchema = TerminalCoreSchema1;
