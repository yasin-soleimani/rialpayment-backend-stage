import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-aggregate-paginate';

const schema = new mongoose.Schema(
  {
    terminal: { type: mongoose.Types.ObjectId, ref: 'MerchantTerminal' },
    ticket: { type: mongoose.Types.ObjectId, ref: 'Ticket' },
    user: { type: mongoose.Types.ObjectId, ref: 'User' },
    card: { type: mongoose.Types.ObjectId, ref: 'Card' },
    cardnumber: { type: Number },
  },
  {
    id: false,
    timestamps: true,
  }
);

schema.plugin(mongoosePaginate);
export const TicketsHistorySchema = schema;
