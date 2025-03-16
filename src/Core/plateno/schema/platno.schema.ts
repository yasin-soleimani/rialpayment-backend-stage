import * as mongoose from 'mongoose';

const PlatnoSchema1 = new mongoose.Schema({
  user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
  platno: { type: String, index: true },
  p1: { type: String, index: true },
  p2: { type: String, index: true },
  p3: { type: String, index: true },
  p4: { type: String, index: true },
  status: { type: Boolean, default: true },
});

PlatnoSchema1.index({ platno: 1, p1: 1, p2: 1, p3: 1, p4: 1 }, { unique: true });

export const PlatnoSchema = PlatnoSchema1;
