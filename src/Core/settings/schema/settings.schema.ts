import * as mongoose from 'mongoose';

const SettingsSchema1 = new mongoose.Schema({
  _id: { type: String, default: 'EntityId' },
  club: { type: mongoose.SchemaTypes.ObjectId, ref: 'SettingsClub' },
  creditinmerchant: { type: Number, default: 1 },
  mpl: {
    module: { type: String },
    exponent: { type: String },
  },
  voucher: [
    {
      from: { type: Number },
      to: { type: Number },
      percent: { type: Number },
    },
  ],
  sitad: { type: Boolean, default: false },
  cashout: {
    status: { type: Boolean, default: true },
    range: [
      {
        from: { type: Number },
        to: { type: Number },
        amount: { type: Number },
      },
    ],
  },
});

export const SettingsSchema = SettingsSchema1;
