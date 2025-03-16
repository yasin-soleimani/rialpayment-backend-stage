import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-aggregate-paginate';

const GroupSchema1 = new mongoose.Schema(
  {
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'user', index: true },
    title: { type: String, index: true },
    status: { type: Boolean },
    description: { type: String },
    public: { type: Boolean, default: 'false' },
  },
  { timestamps: true }
);

GroupSchema1.index({ user: 1, title: 1 }, { unique: true });
GroupSchema1.virtual('users', {
  ref: 'Group',
  localField: '_id',
  foreignField: 'group',
});
GroupSchema1.plugin(mongoosePaginate);
export const GroupSchema = GroupSchema1;
