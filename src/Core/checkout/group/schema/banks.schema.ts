import * as mongoose from 'mongoose';

const BanksSchema = new mongoose.Schema({
  code: { type: Number, unique: true },
  title: { type: String, required: true },
});

export const CheckoutGroupBankSchema = BanksSchema;
