import * as mongoose from 'mongoose';

const PspipCoreSchema1 = new mongoose.Schema(
  {
    ip: { type: String, required: true, unique: true },
    psp: { type: mongoose.SchemaTypes.ObjectId, ref: 'Psp' },
  },
  { timestamps: true }
);

export const PspipCoreSchema = PspipCoreSchema1;
