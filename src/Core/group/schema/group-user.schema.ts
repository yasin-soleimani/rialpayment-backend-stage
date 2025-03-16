import * as mongoose from 'mongoose';
import * as mongooseQueryPaginate from 'mongoose-paginate';
import * as mongoosePaginate from 'mongoose-aggregate-paginate';

const GroupUserSchema1 = new mongoose.Schema(
  {
    group: { type: mongoose.SchemaTypes.ObjectId, ref: 'Group', index: true },
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User', index: true },
    card: { type: mongoose.SchemaTypes.ObjectId, ref: 'Card', index: true },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

GroupUserSchema1.index({ user: 1 });
GroupUserSchema1.index({ card: 1 });
GroupUserSchema1.index({ group: 1 });

// GroupUserSchema1.index({ group: 1, user: 1}, { unique: true });
// GroupUserSchema1.index({ group: 1, card: 1}, { unique: true });
GroupUserSchema1.virtual('strategy', {
  ref: 'MerchantStrategy',
  localField: 'group',
  foreignField: 'group',
});

GroupUserSchema1.virtual('users', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
});

GroupUserSchema1.virtual('user.card', {
  ref: 'Card',
  localField: 'user',
  foreignField: 'user',
});
GroupUserSchema1.plugin(mongooseQueryPaginate);
GroupUserSchema1.plugin(mongoosePaginate);
export const GroupUserSchema = GroupUserSchema1;
