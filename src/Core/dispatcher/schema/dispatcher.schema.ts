import * as mongoose from 'mongoose';

const DisptcherUserSchema1 = new mongoose.Schema(
  {
    username: String,
    password: String,
    title: String,
    exp: { type: mongoose.SchemaTypes.Date },
    status: Boolean,
    url: String,
  },
  { timestamps: true }
);

export const DispatcheruserSchema = DisptcherUserSchema1;
