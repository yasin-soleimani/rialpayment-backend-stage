import * as mongoose from 'mongoose';

const BanksSchema1 = new mongoose.Schema(
  {
    title: { type: String, required: true },
    code: { type: Number, unique: true },
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const BanksSchema = BanksSchema1;
