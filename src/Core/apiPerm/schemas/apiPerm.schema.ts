import * as mongoose from 'mongoose';
import { ObjectId } from 'bson';

export const ApiPermSchema = new mongoose.Schema({
  user: { type: mongoose.SchemaTypes.ObjectId, unique: true, ref: 'User' },
  username: { type: String, unique: true },
  password: String,
  ip: String,
  auth: Boolean,
  authamount: Number,
  shahkar: Boolean,
  sitad: Boolean,
  nahab: Boolean,
  nahabamount: Number,
  post: Boolean,
  postamount: Number,
  asnaf: Boolean,
  asnafamount: Number,
});
