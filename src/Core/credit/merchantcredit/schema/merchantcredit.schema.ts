import * as mongoose from 'mongoose';

const MerchanCreditSchema1 = new mongoose.Schema(
  {
    terminal: { type: mongoose.SchemaTypes.ObjectId, ref: 'MerchantTerminal' },
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
    status: Boolean,
    cobenefit: { type: Number, default: 2.5 },
    primarybenefit: { type: Number, default: 2.5 },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

export const MerchanCreditSchema = MerchanCreditSchema1;
