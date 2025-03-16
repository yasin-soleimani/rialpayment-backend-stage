import * as mongoose from 'mongoose';

export const AclSchema = new mongoose.Schema(
  {
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User', unique: true },
    expire: { type: mongoose.SchemaTypes.Date },
    agentnewuser: { type: Boolean, default: false },
    merchants: { type: Boolean, default: false },
    ipg: { type: Boolean, default: false },
    managecredit: { type: Boolean, default: false },
    customerclub: { type: Boolean, default: false },
    customerclubmanager: { type: Boolean, default: false },
    national: { type: Boolean, default: false },
    nationalagent: { type: Boolean, default: false },
    leasingmanager: { type: Boolean, default: false },
    leasing: { type: Boolean, default: false },
    createdAt: { type: Date },
  },
  { timestamps: true }
);
