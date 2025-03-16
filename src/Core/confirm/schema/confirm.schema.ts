import * as mongoose from 'mongoose';

export const ConfirmSchema = new mongoose.Schema({
  mobile: { type: Number, required: true, unique: true },
  acode: { type: String },
});
