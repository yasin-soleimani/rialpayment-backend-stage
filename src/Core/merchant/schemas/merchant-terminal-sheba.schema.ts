import * as mongoose from 'mongoose';

export const MerchantTerminalShebaSchema = new mongoose.Schema({
  terminal: { type: mongoose.SchemaTypes.ObjectId, ref: 'MerchantTerminal' },
  sheba: { type: String },
  percent: { type: Number },
});
