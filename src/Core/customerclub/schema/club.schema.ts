import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';
import * as mongooseAggregatePaginate from 'mongoose-aggregate-paginate';

const ClubSchema1 = new mongoose.Schema(
  {
    title: { type: String, required: true },
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    owner: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    ref: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    priority: { type: Number, default: 1 },
    logo: { type: String },
    customerwage: Boolean,
    merchantwage: Boolean,
    status: { type: Boolean, default: true },
    personalpage: {
      status: { type: Boolean, default: false },
      domain: String,
    },
    cardinfo: {
      status: { type: Boolean, default: false },
      price: { type: Number, default: 20000 },
      max: { type: Number, default: 0 },
    },
    clubinfo: {
      tell: { type: Number, default: 0 },
      fax: { type: Number, default: 0 },
      email: { type: String },
      website: { type: String },
      address: { type: String },
      province: { type: String },
      city: { type: String },
    },
    sms: {
      provider: { type: String, default: 'Asanak' },
      username: { type: String, default: '' },
      password: { type: String, default: '' },
      number: { type: String, default: '' },
    },
    userinfo: {
      status: { type: Boolean, default: false },
      price: { type: Number, default: 20000 },
      max: { type: Number, default: 0 },
    },
    operator: {
      status: Boolean,
      max: Number,
    },
    ads: {
      birthday: Boolean,
      advert: Boolean,
      system: Boolean,
      trax: Boolean,
    },
    merchant: {
      status: { type: Boolean, default: false },
      price: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
    },
    expire: { type: mongoose.SchemaTypes.Date, default: Date.now },
    createdAt: { type: mongoose.SchemaTypes.Date, default: Date.now },
    code: { type: String },
  },
  { timestamps: true }
);

ClubSchema1.plugin(mongoosePaginate);
ClubSchema1.plugin(mongooseAggregatePaginate);

export const CLubSchema = ClubSchema1;
