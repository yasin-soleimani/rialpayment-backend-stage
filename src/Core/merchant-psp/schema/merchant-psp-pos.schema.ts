import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';
import { MerchantPspRequestSchema } from './merchant-psp-request.schema';

export const MerchantPspPosSchema = new mongoose.Schema(
  {
    posModel: { type: String },
    posSerialNumber: { type: String },
    posType: { type: String },
    isBind: { type: Boolean, default: false },
    bindTerminalId: { type: String },
    savedId: { type: String },
    merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'MerchantPspCustomer' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    res: [{ type: String }],
  },
  { timestamps: true }
);
MerchantPspRequestSchema.plugin(mongoosePaginate);
