import * as mongoose from 'mongoose';

const CheckoutAutomaticSchema1 = new mongoose.Schema(
  {
    hour: { type: Number, default: 8 },
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    account: { type: String, required: true },
    from: { type: mongoose.SchemaTypes.ObjectId, ref: '' },
    status: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const CheckoutAutomaticSchema = CheckoutAutomaticSchema1;
