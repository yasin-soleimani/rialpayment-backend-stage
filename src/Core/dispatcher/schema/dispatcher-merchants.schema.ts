import * as mongoose from 'mongoose';

const DisptcherMerchantSchema1 = new mongoose.Schema(
  {
    dispatcheruser: { type: mongoose.SchemaTypes.ObjectId, ref: 'Dispatcheruser' },
    merchantcode: { type: Number, unique: true },
    status: Boolean,
  },
  { timestamps: true }
);

export const DispatchermerchantSchema = DisptcherMerchantSchema1;
