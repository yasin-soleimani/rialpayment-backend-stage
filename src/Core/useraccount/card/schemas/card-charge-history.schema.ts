import * as mongoose from 'mongoose';
import * as monngosePaginate from 'mongoose-paginate';

const CardChargeHistorySchemaTemp = new mongoose.Schema(
  {
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    card: { type: mongoose.SchemaTypes.ObjectId, ref: 'Card' },
    cardno: { type: Number },
    amount: { type: Number, required: true },
    type: { type: Number },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

export const CardChargeHistorySchema = CardChargeHistorySchemaTemp;
