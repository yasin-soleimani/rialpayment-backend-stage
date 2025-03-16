import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';

const SubmitSchema1 = new mongoose.Schema(
  {
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    checkout: { type: mongoose.SchemaTypes.ObjectId, ref: 'Checkout' },
    amount: { type: Number },
    bankname: String,
    account: { type: String },
    status: { type: Number },
    data: { type: String },
    bankaccount: { type: mongoose.SchemaTypes.ObjectId, ref: 'CheckoutBankAccounts' },
  },
  { timestamps: true }
);

SubmitSchema1.plugin(mongoosePaginate);

export const SubmitSchema = SubmitSchema1;
