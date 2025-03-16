import * as mongoose from 'mongoose';
import * as mongooseAggregatePaginate from 'mongoose-aggregate-paginate';
import * as mongoosePaginate from 'mongoose-paginate';

const schema = new mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: 'User' },
    report: { type: mongoose.Types.ObjectId, ref: 'MerchantSettlementReportModel' },
    merchant: { type: mongoose.Types.ObjectId, ref: 'Merchant' },
    forDate: { type: String },
    fromDate: { type: Date },
    toDate: { type: Date },
    sum: { type: Number, default: 0 },
    sumAfterWage: { type: Number, default: 0 },
    wage: { type: Number, default: 0 },
    terminals: {
      type: [
        {
          terminal: { type: mongoose.Types.ObjectId, ref: 'MerchantTerminal' },
          sum: { type: Number, default: 0 },
          sumAfterWage: { type: Number, default: 0 },
          wage: { type: Number, default: 0 },
        },
      ],
    },
  },
  {
    id: false,
    timestamps: true,
  }
);
schema.index({ user: 1 });
schema.index({ merchant: 1 });
schema.index({ forDate: 1 });
schema.index({ terminals: 1 });

schema.plugin(mongooseAggregatePaginate);
schema.plugin(mongoosePaginate);
export const merchantSettlementsSchema = schema;
