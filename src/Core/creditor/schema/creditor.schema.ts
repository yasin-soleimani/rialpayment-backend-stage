import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';

const CreditorSchemaTmp = new mongoose.Schema(
  {
    subject: { type: mongoose.SchemaTypes.ObjectId, ref: 'CreditorSubject' },
    type: { type: Number, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    status: { type: Boolean, default: true },
    visible: { type: Boolean, default: true },
    ref: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

CreditorSchemaTmp.plugin(mongoosePaginate);

export const CreditorSchema = CreditorSchemaTmp;
