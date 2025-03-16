import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';
import { mongo } from 'mongoose';

const CreditHistorySchema1 = new mongoose.Schema(
  {
    amount: { type: Number, default: 0 },
    prepaid: { type: Number, default: 0 },
    from: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    to: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    terminal: { type: mongoose.SchemaTypes.ObjectId, ref: 'MerchantTerminal' },
    visible: { type: Boolean, default: false },
    advance: {
      qty: Number,
      benefit: Number,
      prepaid: Number,
      beforedeadline: Number,
      freemonths: { type: Number, default: 0 },
    },
    type: Number,
    cobenefit: Number,
    tenday: Number,
    tnyday: Number,
    remain: Number,
    status: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

CreditHistorySchema1.virtual('installs', {
  ref: 'CreditInstallments',
  localField: '_id',
  foreignField: 'shopid',
});

CreditHistorySchema1.plugin(mongoosePaginate);

export const CreditHistorySchema = CreditHistorySchema1;
