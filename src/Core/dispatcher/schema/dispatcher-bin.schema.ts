import * as mongoose from 'mongoose';

const DispatcherBinSchema1 = new mongoose.Schema(
  {
    dispatcheruser: { type: mongoose.SchemaTypes.ObjectId, ref: 'Dispatcheruser' },
    bin: Number,
    status: Boolean,
  },
  { timestamps: true }
);

export const DispatcherbinSchema = DispatcherBinSchema1;
