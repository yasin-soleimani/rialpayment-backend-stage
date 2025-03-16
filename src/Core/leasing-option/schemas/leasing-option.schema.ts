import { Schema, SchemaTypes, Types } from 'mongoose';

const schema = new Schema(
  {
    leasingUser: { type: Types.ObjectId, ref: 'User', required: true },
    baseOption: { type: Types.ObjectId, ref: 'LeasingOption', default: null },
    title: { type: String, maxlength: 128, minlength: 8, required: true },
    description: { type: String, maxlength: 1000, default: '' },
    status: { type: Boolean, default: true },
    visible: { type: Boolean, default: false },
    amount: { type: Number, required: true },
    months: { type: Number, required: true },
    interest: { type: Number, required: true, min: 0, max: 100, default: 0 },
    tenDayPenalty: { type: Number, required: true, min: 0, max: 100, default: 0 },
    twentyDayPenalty: { type: Number, required: true, min: 0, max: 100, default: 0 },
    isCustomizable: { type: Boolean, default: false },
    customAmount: { type: Number, default: null },
    minCustomAmount: { type: Number, default: null },
    maxCustomAmount: { type: Number, default: null },
    terminals: [
      {
        type: SchemaTypes.ObjectId,
        ref: 'MerchantTerminal',
        default: [],
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

export const leasingOptionSchema = schema;
