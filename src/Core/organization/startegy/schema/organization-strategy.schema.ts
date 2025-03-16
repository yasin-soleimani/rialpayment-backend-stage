import * as mongoose from 'mongoose';

export const OrganizationStrategySchema = new mongoose.Schema({
  terminal: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'MerchantTerminal' }],
  group: { type: mongoose.SchemaTypes.ObjectId, ref: 'Group' },
  min: Number,
  max: Number,
  expire: Number,
  refresh: Number,
  customercharge: Number,
  daysofweek: [{ type: Number }],
  user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
});
