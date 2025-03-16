import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';

export const TerminalBalanceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    terminal: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'MerchantTerminal' }],
    amount: { type: Number },
    expire: Date,
    daysofweek: [{ type: Number }],
    card: { type: mongoose.SchemaTypes.ObjectId, ref: 'Card' },
    type: { type: Number },
  },
  { timestamps: true }
);
TerminalBalanceSchema.index({ user: 1 });
TerminalBalanceSchema.index({ terminal: 1 });
TerminalBalanceSchema.index({ amount: 1 });
TerminalBalanceSchema.index({ createdAt: 1 });
TerminalBalanceSchema.index({ card: 1 });
