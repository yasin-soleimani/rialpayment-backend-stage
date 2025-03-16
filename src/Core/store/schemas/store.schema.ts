import * as mongoose from 'mongoose';

export const StoreSchema = new mongoose.Schema(
  {
    nickname: { type: String, unique: true },
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    logo: { type: String },
    category: { type: Number },
    email: { type: String },
    StoreTel: { type: Number },
    address: { type: String, required: true },
    tell: { type: Number, required: true },
    pictures: [{ type: String }],
    terminal_id: { type: String },
    merchant_id: { type: String },
  },
  { timestamps: true }
);
