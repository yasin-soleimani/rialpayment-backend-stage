import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';

const TerminalBookmarkSchema1 = new mongoose.Schema(
  {
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    terminal: { type: mongoose.SchemaTypes.ObjectId, ref: 'MerchantTerminal' },
    bookmarked: Boolean,
  },
  { timestamps: true }
);

TerminalBookmarkSchema1.plugin(mongoosePaginate);

export const TerminalBookmarkSchema = TerminalBookmarkSchema1;
