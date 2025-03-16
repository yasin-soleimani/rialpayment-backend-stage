import * as mongoose from 'mongoose';
import { autoIncrement } from 'mongoose-plugin-autoinc';

const CheckoutBankAccountSchema1 = new mongoose.Schema({
  bank: { type: mongoose.SchemaTypes.ObjectId, ref: 'Bank' },
  account: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  staticpin: { type: String, required: true },
  status: { type: Boolean, default: true },
  max: { type: Number, default: 1000000000 },
});

CheckoutBankAccountSchema1.plugin(autoIncrement, {
  model: 'BankAccount',
  field: 'index',
  startAt: 1,
  incrementBy: 1,
});

export const CheckoutBankAccountSchema = CheckoutBankAccountSchema1;
