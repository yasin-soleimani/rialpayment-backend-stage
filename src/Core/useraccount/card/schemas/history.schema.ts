import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';

const CardHistorySchema1 = new mongoose.Schema(
  {
    secpin: String,
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    amount: Number,
    ref: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    type: Number,
    opt: String,
  },
  { timestamps: true }
);

CardHistorySchema1.plugin(mongoosePaginate);

export const CardHistorySchema = CardHistorySchema1;
