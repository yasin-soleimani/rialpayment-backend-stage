import * as mongoose from 'mongoose';

export const PricelistSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true }
);
