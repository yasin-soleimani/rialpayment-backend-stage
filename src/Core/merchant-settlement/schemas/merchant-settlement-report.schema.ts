import * as mongoose from 'mongoose';
import * as mongooseAggregatePaginate from 'mongoose-aggregate-paginate';
import * as mongoosePaginate from 'mongoose-paginate';

const schema = new mongoose.Schema(
  {
    date: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    sum: { type: Number, default: 0 },
    sumAfterWage: { type: Number, default: 0 },
    wage: { type: Number, default: 0 },
    merchants: {
      type: [
        {
          merchant: { type: mongoose.Types.ObjectId, ref: 'Merchant' },
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

schema.index({ date: 1 });
schema.index({ startDate: 1 });
schema.index({ endDate: 1 });
schema.index({ merchants: 1 });

schema.plugin(mongooseAggregatePaginate);
schema.plugin(mongoosePaginate);

export const merchantSettlementReportSchema = schema;
