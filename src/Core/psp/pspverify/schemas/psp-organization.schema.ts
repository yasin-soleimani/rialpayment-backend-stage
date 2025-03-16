import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';
import * as mongooseAggregatePaginate from 'mongoose-aggregate-paginate';

const PspOrganizationSchema1 = new mongoose.Schema(
  {
    charge: Number,
    wallet: Number,
    organ: Number,
    amount: Number,
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    strategy: { type: mongoose.SchemaTypes.ObjectId, ref: '' },
    terminal: { type: mongoose.SchemaTypes.ObjectId, ref: 'MerchantTerminal' },
    ref: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    card: { type: mongoose.SchemaTypes.ObjectId, ref: 'Card' },
  },
  { timestamps: true }
);

PspOrganizationSchema1.plugin(mongoosePaginate);
PspOrganizationSchema1.plugin(mongooseAggregatePaginate);

export const PspOrganizationSchema = PspOrganizationSchema1;
