import * as mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    basketStore: { type: mongoose.Types.ObjectId, ref: 'BasketStore', required: true },
    day: { type: Number, index: true },
    status: { type: Boolean, default: true },
    startTime: { type: String, required: true, index: true },
    endTime: { type: String, required: true },
    capacity: { type: Number, default: 0, required: true },
  },
  {
    id: false,
    timestamps: true,
  }
);

schema.index({ basketStore: 1, day: 1, startTime: 1 }, { unique: true });

export const BasketDeliveryTimeSchema = schema;
