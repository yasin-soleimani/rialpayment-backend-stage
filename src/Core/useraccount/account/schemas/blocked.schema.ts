import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';
import * as mongooseAggregatePaginate from 'mongoose-aggregate-paginate';

const AccountBlockSchema1 = new mongoose.Schema(
  {
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    type: { type: String, default: 'wallet' },
    status: { type: Boolean, default: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

AccountBlockSchema1.plugin(mongoosePaginate);
AccountBlockSchema1.plugin(mongooseAggregatePaginate);

export const AccountBlockSchema = AccountBlockSchema1;
