import * as mongoose from 'mongoose';

export const IdentifyRejectSchema = new mongoose.Schema(
  {
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    identify: { type: mongoose.SchemaTypes.ObjectId, ref: 'UserIdentify' },
    reason: { type: String },
  },
  { timestamps: true }
);
