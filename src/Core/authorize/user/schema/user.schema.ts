import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';
import * as mongooseAggregatePaginate from 'mongoose-aggregate-paginate';

const AuthorizeUserSchema1 = new mongoose.Schema(
  {
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    website: { type: String },
    apikey: { type: String },
    callback: { type: String },
    tel: { type: Number },
    mobile: { type: String },
    description: { type: String },
    logo: { type: String },
    title: { type: String },
    postalcode: { type: String },
    address: { type: String },
    email: { type: String },
    status: { type: Boolean, default: false },
    type: { type: Number },
    ip: [{ type: String }],
  },
  { timestamps: true }
);

AuthorizeUserSchema1.plugin(mongoosePaginate);
AuthorizeUserSchema1.plugin(mongooseAggregatePaginate);

export const AuthorizeUserSchema = AuthorizeUserSchema1;
