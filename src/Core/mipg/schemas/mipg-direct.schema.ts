import * as mongoose from 'mongoose';

export const MipgDirectSchema = new mongoose.Schema(
  {
    mipg: { type: mongoose.SchemaTypes.ObjectId, ref: 'Mipg' },
    psp: { type: Number, default: 1 },
    loginaccount: { type: String },
    customercode: { type: String },
    mid: { type: Number },
    merchantconfigid: { type: String },
    iv: { type: String },
    key: { type: String },
    terminal: { type: String },
    merchant: { type: String },
    sdk: { type: Boolean, default: false },
    hash: [{ type: String }],
    pkg: [{ type: String }],
    status: { type: Boolean, default: true },
    wagetype: { type: Number, default: 2 },
    karmozd: { type: Number, default: 0 },
    type: { type: Number, default: 1 },
    pardakhtyari: { type: Boolean, default: false },
    acceptorcode: { type: String },
    sheba: { type: String },
    username: { type: String },
    password: { type: String },
  },
  { timestamps: true }
);
