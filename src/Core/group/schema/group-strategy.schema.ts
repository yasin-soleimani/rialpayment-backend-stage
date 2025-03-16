import * as mongoose from 'mongoose';

const GroupStrategySchema1 = new mongoose.Schema({
  group: { type: mongoose.SchemaTypes.ObjectId, ref: 'Group' },
  discount: {
    bankdisc: Number,
    nonbankdisc: Number,
  },
  credit: {
    type: Number,
    advance: {
      qty: Number,
      benefit: Number,
      prepayment: Number,
      beforedeadline: Number,
      freemonths: { type: Number, default: 0 },
      cobenefit: { type: Number, default: 2.5 },
    },
    tenday: Number,
    tnyday: Number,
    primarybenefit: { type: Number, default: 2.5 },
  },
});

export const GroupStrategySchema = GroupStrategySchema1;
