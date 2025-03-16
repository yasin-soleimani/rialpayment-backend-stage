import * as mongoose from 'mongoose';

export const RequestSchema = new mongoose.Schema({
  username: { type: String },
  password: { type: String },
  ip: { type: String },
  request: { type: String },
  response: { type: String },
});
