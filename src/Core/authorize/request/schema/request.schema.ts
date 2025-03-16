import * as mongoose from 'mongoose';

export const AuthorizeRequestSchema = new mongoose.Schema(
  {
    apikey: { type: String },
    type: { type: Number },
    trackingnumber: { type: Number },
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    auth: { type: mongoose.SchemaTypes.ObjectId, ref: 'AuthorizeUser' },
    token: { type: String },
    ip: { type: String },
    success: { type: Boolean, default: true },
    req: {
      mobile: { type: Number },
      ip: { type: String },
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
