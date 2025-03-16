import * as mongoose from 'mongoose';

export const CardTransferSchema = new mongoose.Schema(
  {
    pan: { type: Number, required: true },
    pin: { type: String, requied: true },
    cvv2: { type: String },
    expire: { type: String },
    amount: { type: Number, required: true },
    destination_pan: { type: Number, required: true },
    source_user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    destination_user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    success: { type: Boolean, default: false },
  },
  { timestamps: true }
);
