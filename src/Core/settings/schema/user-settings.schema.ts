import * as mongoose from 'mongoose';

export const UserSettingsSchema = new mongoose.Schema({
  user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
  voucher: [
    {
      from: { type: Number },
      to: { type: Number },
      percent: { type: Number },
    },
  ],
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
