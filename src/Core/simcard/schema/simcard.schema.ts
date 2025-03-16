import * as mongoose from 'mongoose';

export const SimcardSchema = new mongoose.Schema(
  {
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    mobile: String,
    amount: Number,
    res: { type: String, default: null },
    transactionId: { type: String, default: null },
  },
  { timestamps: true }
);
