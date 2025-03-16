import * as mongoose from 'mongoose';

export const AuthorizeClientSchema = new mongoose.Schema(
  {
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    auth: { type: mongoose.SchemaTypes.ObjectId, ref: 'AuthorizeUser' },
    status: { type: Boolean, default: true },
    permissions: {
      buy: {
        status: { type: Boolean, default: false },
        max: { type: Number, default: 0 },
      },
      info: {
        status: { type: Boolean, default: true },
      },
    },
  },
  { timestamps: true }
);
