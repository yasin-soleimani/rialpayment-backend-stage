import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';

const OrganizationPoolSchemaTmp = new mongoose.Schema(
  {
    groups: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'Group' }],
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    title: { type: String },
    minremain: { type: Number, default: 20000000 },
    charge: { type: Boolean, default: false },
    status: { type: Boolean, default: true },
    bill: { type: Boolean, default: false },
    billwage: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

OrganizationPoolSchemaTmp.plugin(mongoosePaginate);
OrganizationPoolSchemaTmp.virtual('turnover', {
  ref: 'OrganizationPoolTurnOver',
  localField: '_id',
  foreignField: 'pool',
  justOne: true,
  options: { sort: { createdAt: -1 } },
});
export const OrganizationPoolSchema = OrganizationPoolSchemaTmp;
