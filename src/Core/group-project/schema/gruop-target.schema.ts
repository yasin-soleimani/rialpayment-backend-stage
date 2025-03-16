import * as mongoose from 'mongoose';

export const GroupProjectTargetSchema = new mongoose.Schema({
  group: { type: mongoose.SchemaTypes.ObjectId, ref: 'GroupProject' },
  title: { type: String },
});
