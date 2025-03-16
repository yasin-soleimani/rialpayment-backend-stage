import * as mongoose from 'mongoose';

export const OperatorSchema = new mongoose.Schema({
  username: String,
  password: String,
  ref: { type: mongoose.Types.ObjectId, ref: 'User' },
});
