import * as mongoose from 'mongoose';

const schema = new mongoose.Schema({
  type: String,
  balance: Number,
  currency: String,
  user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
});

schema.index({ user: 1 });
export const AccountSchema = schema;
