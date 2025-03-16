import * as mongoose from 'mongoose';

export const SessionSchema = new mongoose.Schema({
  _id: String,
  ids: String,
  expires: mongoose.SchemaTypes.Date,
  session: String,
});
