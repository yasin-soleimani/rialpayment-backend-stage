import * as mongoose from 'mongoose';

export const MerchantDiscountSrategyCoreSchema = new mongoose.Schema({
  terminal: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'MerchantTerminal' }],
  merchant: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'Merchant' }],
  group: { type: mongoose.SchemaTypes.ObjectId, ref: 'Group' },
  parent: { type: mongoose.SchemaTypes.ObjectId, ref: 'MerchantStrategy' },
  type: { type: Number },
  start: { type: Date },
  expire: { type: Date },
  bankdisc: { type: Number, default: 0 },
  nonebankdisc: { type: Number, default: 0 },
  from: { type: String },
  to: { type: String },
  daysofweek: [{ type: Number }],
  priority: { type: Number },
  automaticwage: { type: Boolean, default: true },
  wage: { type: Number, default: 15 },
  wagetime: { type: Number, default: 1 },
  percentpertime: { type: Number, default: 50 },
  opt: { type: Number },
});
