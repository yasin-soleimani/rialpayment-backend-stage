import * as mongoose from 'mongoose';

export const AgentsSettingsSchema = new mongoose.Schema({
  user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
  cardprice: { type: Number, default: 20000 },
  creditinmerchant: { type: Number, default: 1 },
});
