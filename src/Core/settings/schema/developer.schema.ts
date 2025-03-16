import * as mongoose from 'mongoose';

export const UserDeveloperSchema = new mongoose.Schema(
  {
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    callback: {
      status: { type: Boolean, default: false },
      url: { type: String },
    },
  },
  { timestamps: true }
);
