import * as mongoose from 'mongoose';

export const MipgAuthSchema = new mongoose.Schema(
  {
    mipg: { type: mongoose.SchemaTypes.ObjectId, ref: 'Mipg', unique: true },
    status: { type: Boolean, default: false },
    sitad: { type: Boolean, default: false },
    mobile: { type: Boolean, default: false },
    shahkar: { type: Boolean, default: false },
    nahab: { type: Boolean, default: false },
  },
  { timestamps: true }
);
