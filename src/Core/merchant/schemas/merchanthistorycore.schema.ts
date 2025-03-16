import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';

const MerchanthistoryCoreSchema1 = new mongoose.Schema({
  user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
  terminal: { type: mongoose.SchemaTypes.ObjectId, ref: 'MerchantTerminal' },
  amount: { type: Number },
  exp: { type: mongoose.SchemaTypes.Date },
});
MerchanthistoryCoreSchema1.plugin(mongoosePaginate);

export const MerchanthistoryCoreSchema = MerchanthistoryCoreSchema1;
