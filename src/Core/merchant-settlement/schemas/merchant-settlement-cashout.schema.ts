import * as mongoose from 'mongoose';
import * as mongooseAggregatePaginate from 'mongoose-aggregate-paginate';
import * as mongoosePaginate from 'mongoose-paginate';

const schema = new mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: 'User' },
    merchant: { type: mongoose.Types.ObjectId, ref: 'Merchant' },
    amount: { type: Number, default: 0 },
    balanceBefore: { type: Number, default: 0 },
    balanceAfter: { type: Number, default: 0 },
  },
  {
    id: false,
    timestamps: true,
  }
);

schema.index({ user: 1 });
schema.index({ merchant: 1 });
schema.index({ createdAt: 1 });

schema.plugin(mongooseAggregatePaginate);
schema.plugin(mongoosePaginate);
export const merchantSettlementCashoutSchema = schema;
