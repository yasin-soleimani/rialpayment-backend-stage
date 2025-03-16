import * as mongoose from 'mongoose';

const CheckoutUserBankSchema = new mongoose.Schema({
  user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
  bank: { type: mongoose.SchemaTypes.ObjectId, ref: 'CheckoutBanks' },
});
