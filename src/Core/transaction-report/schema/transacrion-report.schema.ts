import * as mongoose from 'mongoose';
import * as mongoosePagiate from 'mongoose-paginate';

export const GroupReportSchema = new mongoose.Schema(
  {
    cardno: { type: Number, required: true, index: true },
    terminal: { type: Number, required: true, index: true },
    merchant: { type: Number, required: true, index: true },
    total: { type: Number, required: true, index: true },
    discount: { type: Number, default: 0, index: true },
    wallet: { type: Number, default: 0 },
    bis: { type: Number, default: 0 },
    organization: { type: Number, default: 0 },
    credit: { type: Number, default: 0 },
    date: { type: Date, index: true },
    rid: { type: mongoose.SchemaTypes.ObjectId },
  },
  { timestamps: true }
);
GroupReportSchema.plugin(mongoosePagiate);

GroupReportSchema.index({ cardno: 1, terminal: 1, merchant: 1, total: 1, date: 1, discount: 1 }, { unique: true });
