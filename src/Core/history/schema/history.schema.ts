import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';

const HistorySchema1 = new mongoose.Schema(
  {
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User', index: true },
    amount: { type: Number, default: 0, index: true },
    type: { type: Number, default: 0, index: true },
    title: { type: String, default: '' },
    ref: { type: String, index: true },
    mod: { type: Number },
    status: { type: Boolean },
  },
  { timestamps: true }
);

mongoose.plugin(mongoosePaginate);
HistorySchema1.index({ user: 1, ref: 1 }, { unique: true });
export const HistorySchema = HistorySchema1;
