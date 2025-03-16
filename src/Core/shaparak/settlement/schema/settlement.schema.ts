import * as mongoose from 'mongoose';

export const ShaparakSettlementSchema = new mongoose.Schema(
  {
    terminalid: { type: String, required: true },
    acceptorcode: { type: String },
    terminal: { type: String },
    sheba: { type: String },
    amount: { type: Number },
    psp: { type: Number },
    karmozd: { type: Number },
    total: { type: Number },
    trax: { type: mongoose.SchemaTypes.ObjectId, ref: 'Ipg' },
    date: { type: Date },
  },
  { timestamps: true }
);
