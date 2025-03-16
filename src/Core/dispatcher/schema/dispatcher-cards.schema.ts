import * as mongoose from 'mongoose';

const DispatcherCardsSchema1 = new mongoose.Schema(
  {
    dispatcheruser: { type: mongoose.SchemaTypes.ObjectId, ref: 'Dispatcheruser' },
    cardno: Number,
    status: Boolean,
  },
  { timestamps: true }
);

export const DispatcherCardsSchema = DispatcherCardsSchema1;
