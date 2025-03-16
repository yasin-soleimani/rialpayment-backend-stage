import * as mongoose from 'mongoose';
import { autoIncrement } from 'mongoose-plugin-autoinc';
import * as mongoosePaginate from 'mongoose-paginate';
import * as mongooseAggregatePaginate from 'mongoose-aggregate-paginate';

const MerchantcoreSchema1 = new mongoose.Schema(
  {
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    psp: { type: mongoose.SchemaTypes.ObjectId, ref: 'Psp' },
    ref: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    merchantcode: { type: Number, unique: true },
    title: { type: String },
    address: { type: String, required: true },
    province: { type: String },
    city: { type: String },
    tell: { type: Number, required: true },
    status: { type: Boolean, default: true },
    visible: { type: Boolean, default: true },
    autoSettle: { type: Boolean, default: false },
    autoSettlePeriod: { type: Number, default: 0 },
    autoSettleWage: { type: Number, default: 0 },
    email: { type: String },
    category: String,
    lat: Number,
    long: Number,
    logo: String,
    img1: String,
    img2: String,
    img3: String,
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

MerchantcoreSchema1.index({ autoSettle: 1 });
MerchantcoreSchema1.index({ autoSettlePeriod: 1 });

MerchantcoreSchema1.plugin(autoIncrement, {
  model: 'Merchant',
  field: 'terminalid',
  startAt: 20000,
  incrementBy: 1,
});

MerchantcoreSchema1.virtual('terminals', {
  ref: 'MerchantTerminal',
  localField: '_id',
  foreignField: 'merchant',
});

MerchantcoreSchema1.plugin(mongoosePaginate);
MerchantcoreSchema1.plugin(mongooseAggregatePaginate);

export const MerchantcoreSchema = MerchantcoreSchema1;
