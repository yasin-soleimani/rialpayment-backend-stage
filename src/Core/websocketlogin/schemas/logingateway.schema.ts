import * as mongoose from 'mongoose';

export const SocketSchema = new mongoose.Schema(
  {
    data: { type: String },
    clientid: { type: String },
  },
  { timestamps: true }
);
