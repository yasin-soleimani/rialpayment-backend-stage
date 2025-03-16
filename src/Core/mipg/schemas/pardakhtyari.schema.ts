import * as mongoose from 'mongoose';

const PardakhtyariSchema1 = new mongoose.Schema({
  psp: { type: mongoose.SchemaTypes.ObjectId, ref: 'Psp', index: true },
  user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User', required: true },
  sheba: [{ type: String, required: true }],
  mipg: { type: mongoose.SchemaTypes.ObjectId, ref: 'Mipg', index: true },
  username: String,
  password: String,
  iv: String,
  key: String,
  configid: String,
  acceptorid: { type: String, index: true },
  terminalid: { type: String, index: true },
  default: { type: Boolean, default: false },
});

PardakhtyariSchema1.index({ psp: 1, acceptorid: 1, terminalid: 1 }, { unique: true });

export const PardakhtyariSchema = PardakhtyariSchema1;
