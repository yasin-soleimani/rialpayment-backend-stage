import * as mongoose from 'mongoose';

export const GroupDetailSchema = new mongoose.Schema({
  group: { type: mongoose.SchemaTypes.ObjectId, ref: 'Group' },
  card: {
    addtouser: { type: Boolean, default: true },
    minamount: { type: Number, default: 0 },
  },
  // this array can be empty, if it's empty then this means users and gitfcards of this group can be used in all terminals, otherwise just in selected terminals
  terminals: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'MerchantTerminal' }],
  // if isRestricted is true, then this card can be used only in selected terminals, otherwise it can be used in all terminals
  isRestricted: { type: Boolean },
});
