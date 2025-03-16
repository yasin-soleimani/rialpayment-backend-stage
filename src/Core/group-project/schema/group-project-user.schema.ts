import * as mongoose from 'mongoose';

const GroupProjectUsersSchema1 = new mongoose.Schema(
  {
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User', index: true },
    group: { type: mongoose.SchemaTypes.ObjectId, ref: 'GroupProject', index: true },
  },
  { timestamps: true }
);

GroupProjectUsersSchema1.index({ user: 1, group: 1 }, { unique: true });

export const GroupProjectUsersSchema = GroupProjectUsersSchema1;
