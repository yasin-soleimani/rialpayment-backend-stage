import * as mongoose from 'mongoose';
import { autoIncrement } from 'mongoose-plugin-autoinc';

const PspCoreSchema1 = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true },
    terminalid: { type: Number },
    password: { type: String, required: true },
    description: { type: String },
    status: { type: Boolean, default: true },
    test: { type: Boolean },
    type: { type: Number, default: 14 },
    ip: { type: String, unique: true },
    inc: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

PspCoreSchema1.virtual('ips', {
  ref: 'Pspip',
  localField: '_id',
  foreignField: 'psp',
});

PspCoreSchema1.plugin(autoIncrement, {
  model: 'Psp',
  field: 'terminalid',
  startAt: 10000,
  incrementBy: 1,
});

export const PspCoreSchema = PspCoreSchema1;
