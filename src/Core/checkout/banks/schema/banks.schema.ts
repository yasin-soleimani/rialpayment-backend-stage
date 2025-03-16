import * as mongoose from 'mongoose';

export const CheckoutBanksSchema = new mongoose.Schema({
  current: { type: mongoose.SchemaTypes.ObjectId, ref: 'CheckoutBankAccounts' },
});
