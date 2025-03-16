import * as mongoose from 'mongoose';

export const NationalDocsSchema = new mongoose.Schema({
  user: { type: mongoose.SchemaTypes.ObjectId, ref: 'National' },
  field: { type: String },
  img: { type: String },
});
