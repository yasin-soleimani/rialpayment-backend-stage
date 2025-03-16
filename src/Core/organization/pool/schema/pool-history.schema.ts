import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';

const PoolHistorySchemaTmp = new mongoose.Schema(
  {
    pool: { type: mongoose.SchemaTypes.ObjectId, ref: 'OrganizationPool' },
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    description: { type: String },
    visible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

PoolHistorySchemaTmp.plugin(mongoosePaginate);

export const OrganizationPoolHistorySchema = PoolHistorySchemaTmp;
