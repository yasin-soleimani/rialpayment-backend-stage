import * as mongoose from 'mongoose';
import * as aggregatePaginate from 'mongoose-aggregate-paginate';
import * as paginate from 'mongoose-paginate';

const MerchantTerminalPosInfo = new mongoose.Schema(
  {
    terminal: { type: mongoose.SchemaTypes.ObjectId, ref: 'MerchantTerminal', default: null },
    modelname: { type: String },
    serial: { type: String },
    mac: { type: String },
    clientid: { type: String },
  },
  { timestamps: true }
);

MerchantTerminalPosInfo.plugin(aggregatePaginate);
MerchantTerminalPosInfo.plugin(paginate);

export const MerchantTerminalPosInfoSchema = MerchantTerminalPosInfo;
