import * as mongoose from 'mongoose';

const GroupProjectSchema1 = new mongoose.Schema(
  {
    title: { type: String, required: true },
    code: { type: String, required: true },
    bank: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'Bank', required: true }],
    tags: [{ type: String }],
    sheba: { type: Boolean, default: false },
    default: { type: Number, unique: true },
    delete: { type: Boolean, default: false },
    cashoutapi: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const GroupProjectSchema = GroupProjectSchema1;
