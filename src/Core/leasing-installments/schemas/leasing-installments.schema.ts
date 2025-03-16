import { Schema, Types } from 'mongoose';

const schema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    paid: { type: Boolean, default: false },
    invoiceId: { type: String, default: null },
    amount: { type: Number, required: true, default: 0 },
    dueDate: { type: Date, default: Date.now },
    paidDate: { type: Date, default: null },
    paidAmount: { type: Number, default: 0 },
    leasingUserCredit: {
      type: Types.ObjectId,
      ref: 'LeasingUserCredit',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

schema.index({ user: 1, leasingUserCredit: 1, dueDate: 1 }, { unique: true });

export const LeasingInstallmentsSchema = schema;
