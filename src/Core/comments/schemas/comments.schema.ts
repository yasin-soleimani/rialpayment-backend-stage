import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';

const CommentsSchema1 = new mongoose.Schema({
  user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
  terminal: { type: mongoose.SchemaTypes.ObjectId, ref: 'MerchantTerminal' },
  type: Number,
  visible: Boolean,
  description: String,
});

CommentsSchema1.plugin(mongoosePaginate);

export const CommentsSchema = CommentsSchema1;
