import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';
import * as mongooseAggregatePaginate from 'mongoose-aggregate-paginate';

const IdentifySchema1 = new mongoose.Schema(
  {
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    ninfront: { type: String },
    ninback: { type: String },
    status: { type: Boolean, default: false },
    cardno: { type: String },
    nationalcode: { type: String },
  },
  { timestamps: true }
);

IdentifySchema1.plugin(mongoosePaginate);
IdentifySchema1.plugin(mongooseAggregatePaginate);

export const IdentifySchema = IdentifySchema1;
