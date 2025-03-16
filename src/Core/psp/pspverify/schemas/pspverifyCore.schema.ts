import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';
import * as mongooseAggregatePaginate from 'mongoose-aggregate-paginate';

const PaymentVerifySchema1 = new mongoose.Schema(
  {
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    cardref: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    merchantref: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    terminal: { type: mongoose.SchemaTypes.ObjectId, ref: 'MerchantTerminal' },
    merchant: { type: mongoose.SchemaTypes.ObjectId, ref: 'Merchant' },
    log: { type: mongoose.SchemaTypes.ObjectId, ref: 'Logger' },
    TraxID: Number,
    termtype: { type: Number, default: 14 },
    storeinbalance: { type: Number, default: 0 },
    request: { type: mongoose.SchemaTypes.ObjectId, ref: 'PspRequest' },
    reqin: String,
    reqout: String,
    confirmin: String,
    confirmout: String,
    reqtype: Number,
    credit: { type: mongoose.SchemaTypes.ObjectId, ref: 'PspCredit' },
    discount: { type: mongoose.SchemaTypes.ObjectId, ref: 'PspDiscount' },
    verifyreq: String,
    verifyoutput: String,
    reverse: { type: Boolean, default: false },
    confirm: { type: Boolean, default: false },
  },
  { timestamps: true }
);
PaymentVerifySchema1.index({ user: 1 });
PaymentVerifySchema1.index({ cardref: 1 });
PaymentVerifySchema1.index({ terminal: 1 });
PaymentVerifySchema1.index({ merchant: 1 });
PaymentVerifySchema1.index({ merchantref: 1 });
PaymentVerifySchema1.index({ confirm: 1 });
PaymentVerifySchema1.index({ createdAt: 1 });
PaymentVerifySchema1.plugin(mongoosePaginate);
PaymentVerifySchema1.plugin(mongooseAggregatePaginate);

export const PspverifyCoreSchema = PaymentVerifySchema1;
