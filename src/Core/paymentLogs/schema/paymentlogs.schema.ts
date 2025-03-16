import * as mongoose from 'mongoose';

export const PaymentLogsSchema = new mongoose.Schema({
  user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
  merchant: { type: mongoose.SchemaTypes.ObjectId, ref: 'MerchantTerminal' },
  amount: Number,
  wage: Number,
  userbankwage: Number,
  usernonbankwage: Number,
  clubwage: Number,
  merchantrefwage: Number,
  customerrefwage: Number,
  companywage: Number,
  cardrefwage: Number,
});
