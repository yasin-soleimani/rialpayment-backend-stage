import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';

export const GiftCardReportSchema = new mongoose.Schema(
  {
    group: { type: mongoose.SchemaTypes.ObjectId, ref: 'Group' },
    card: { type: mongoose.SchemaTypes.ObjectId, ref: 'Card' },
    ip: { type: String },
    price: { type: Number },
    discount: { type: Number },
    mobile: { type: String },
    terminal: { type: String },
    code: { type: String },
  },
  { timestamps: true }
);
GiftCardReportSchema.plugin(mongoosePaginate);
