import * as mongoose from 'mongoose';

const AuthorizeUserWageSchema1 = new mongoose.Schema(
  {
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'AuthorizeUser' },
    login: {
      status: { type: Boolean, default: true },
      wagefrom: { type: Number, default: 1 },
      wage: { type: Number },
    },
    pay: {
      status: { type: Boolean, default: false },
      wagetype: { type: Number, default: 1 },
      wagefrom: { type: Number, default: 1 },
      wage: { type: Number },
    },
  },
  { timestamps: true }
);

export const AuthorizeUserWageSchema = AuthorizeUserWageSchema1;
