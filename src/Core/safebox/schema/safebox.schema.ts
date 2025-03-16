import * as mongoose from 'mongoose';

const SafeboxSchema1 = new mongoose.Schema(
  {
    mobile: Number,
    amount: Number,
    from: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    ref: String,
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const SafeboxSchema = SafeboxSchema1;
