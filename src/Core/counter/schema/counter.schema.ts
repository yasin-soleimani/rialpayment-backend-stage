import * as mongoose from 'mongoose';
export const CounterSchema = new mongoose.Schema(
  {
    counterType: { type: String, default: '' },
    year: { type: Number, required: true },
    counter: { type: Number },
  },
  { timestamps: true }
);
