import * as mongoose from 'mongoose';

export const CardcounterSchema = new mongoose.Schema({
  _id: String,
  seq: Number,
  acc: Number,
  traxid: { type: Number, default: 10000 },
  tserial: { type: Number, default: 1 },
  refuser: { type: Number, default: 2000 },
  refagent: { type: Number, default: 100 },
  idcode: { type: Number, default: 1 },
  merchant: { type: Number, default: 11111 },
  terminal: { type: Number, default: 1111111 },
});
