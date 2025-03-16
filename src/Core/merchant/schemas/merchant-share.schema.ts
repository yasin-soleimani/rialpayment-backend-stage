import * as mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    shareFromUser: { type: mongoose.Types.ObjectId, ref: 'User' },
    shareToUser: { type: mongoose.Types.ObjectId, ref: 'User' },
    sharedMerchant: { type: mongoose.Types.ObjectId, ref: 'Merchant' },
    accepted: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
    deleteRequested: { type: Boolean, default: false },
  },
  {
    id: false,
    timestamps: true,
  }
);

export const merchantShareSchema = schema;
