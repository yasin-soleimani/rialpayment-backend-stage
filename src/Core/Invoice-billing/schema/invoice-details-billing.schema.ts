import * as mongoose from 'mongoose';

export const InvoiceDetailsSchema = new mongoose.Schema(
  {
    row: { type: Number },
    title: { type: String },
    qty: { type: Number },
    unit: { type: String },
    unitprice: { type: Number },
    totalamount: { type: Number },
    totalwage: { type: Number },
    companywage: { type: Number },
    agentwage: { type: Number },
    payamount: { type: Number },
    tax: { type: Number },
    pureamount: { type: Number },
    invoice: { type: mongoose.SchemaTypes.ObjectId, ref: 'invoice' },
  },
  { timestamps: true }
);
