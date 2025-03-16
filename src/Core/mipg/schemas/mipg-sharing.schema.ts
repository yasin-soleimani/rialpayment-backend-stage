import * as mongoose from 'mongoose';

export const MipgSharingSchema = new mongoose.Schema(
  {
    mipg: { type: mongoose.SchemaTypes.ObjectId, ref: 'Mipg' },
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    percent: { type: Number, default: 0 },
  },
  { timestamps: true }
);
