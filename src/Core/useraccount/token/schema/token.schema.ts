import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';
import { IToken } from '../interface/token.interface';
import * as jwt from 'jsonwebtoken';

export const TokenSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: 'User' },
    status: { type: Boolean, default: true },
    token: { type: String },
    userAgent: { type: String },
    role: { type: String },
    ip: { type: String },
  },
  { timestamps: true }
);
TokenSchema.plugin(mongoosePaginate);
