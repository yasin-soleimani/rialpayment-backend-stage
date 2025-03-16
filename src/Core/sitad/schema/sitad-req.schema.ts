import * as mongoose from 'mongoose';

export const SitadReqSchema = new mongoose.Schema(
  {
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    req: { type: String },
    res: { type: String },
  },
  { timestamps: true }
);
