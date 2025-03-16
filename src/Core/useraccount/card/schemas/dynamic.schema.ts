import * as mongoose from 'mongoose';

export const CardDynamicPassScehma = new mongoose.Schema(
  {
    cardno: { type: Number, required: true },
    pin: { type: String, required: true },
    card: { type: mongoose.SchemaTypes.ObjectId, ref: 'Card' },
    type: { type: Number },
  },
  { timestamps: true }
);
