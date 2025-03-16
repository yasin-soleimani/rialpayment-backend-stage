import * as mongoose from 'mongoose';

export const GiftCardSettingsSchema = new mongoose.Schema(
  {
    status: { type: Boolean, default: true },
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    group: { type: mongoose.SchemaTypes.ObjectId, ref: 'Group', unique: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
  },
  { timestamps: true }
);
