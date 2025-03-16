import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as securePin from 'secure-pin';
import * as mongoosePaginate from 'mongoose-paginate';
import * as mongooseAggregatePaginate from 'mongoose-aggregate-paginate';
import mongooseCounter from 'mongoose-counters';
import { MongooseAutoIncrementID } from 'mongoose-auto-increment-reworked';

const UserSchema1 = new mongoose.Schema(
  {
    mobile: { type: mongoose.SchemaTypes.Number, required: true, unique: true, index: true },
    nationalcode: { type: mongoose.SchemaTypes.String, sparse: true, index: true },
    title: { type: String, default: 'کاربر ' },
    password: { type: mongoose.SchemaTypes.String, required: true },
    fullname: { type: mongoose.SchemaTypes.String },
    birthdate: mongoose.SchemaTypes.Number,
    avatar: mongoose.SchemaTypes.String,
    fathername: mongoose.SchemaTypes.String,
    place: mongoose.SchemaTypes.String,
    block: { type: mongoose.SchemaTypes.Boolean, default: false },
    maxcheckout: { type: Number, default: 30000000 },
    perhour: { type: Number, default: 180 },
    perday: { type: Number, default: 1 },
    address: mongoose.SchemaTypes.String,
    zipcode: mongoose.SchemaTypes.Number,
    state: mongoose.SchemaTypes.String,
    city: mongoose.SchemaTypes.String,
    active: { type: mongoose.SchemaTypes.Boolean, default: false },
    acode: mongoose.SchemaTypes.String,
    account_no: { type: mongoose.SchemaTypes.Number, unique: true, sparse: true },
    type: { type: mongoose.SchemaTypes.String, default: 'user' },
    clientid: { type: mongoose.Schema.Types.String },
    refid: { type: mongoose.Schema.Types.String, unique: true, sparse: true },
    fcm: String,
    hek: String,
    hmac: String,
    profilestatus: mongoose.SchemaTypes.Number,
    aboutme: mongoose.SchemaTypes.String,
    mywebsite: mongoose.SchemaTypes.String,
    tell: mongoose.SchemaTypes.Number,
    email: mongoose.SchemaTypes.String,
    showMyTellToOthers: Boolean,
    showMyEmailToOthers: Boolean,
    showMyTransferLink: { type: Boolean },
    showMyOwnShopLink: { type: Boolean },
    showMyIranianShopLink: { type: Boolean },
    ref: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    islegal: Boolean,
    checkout: { type: Boolean, default: true },
    access: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    legal: {
      title: String,
      name: String,
      logo: String,
    },
    complete: {
      organ: String,
      sazman: String,
      senf: String,
    },
    vitrinAccess: { type: Boolean, default: false },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

UserSchema1.index({ nationalcode: 1, mobile: 1 }, { unique: true })
// create class PaymentSchema
class User { }
UserSchema1.loadClass(User);

const counter = mongooseCounter(mongoose);
UserSchema1.plugin(counter, { incField: 'zipcode' });

// pre save options
UserSchema1.pre('save', function (this: User, next: any) {
  const doc: any = this;
  const salt = bcrypt.genSaltSync(15);
  const randno = securePin.generatePinSync(4);
  doc.password = bcrypt.hashSync(doc.password, salt);
  doc.acode = randno;

  next();
});
// virtual populate with card
UserSchema1.virtual('card', {
  ref: 'Card',
  localField: '_id',
  foreignField: 'user',
  justOne: true,
});

UserSchema1.virtual('usergroup', {
  ref: 'GroupUser',
  localField: '_id',
  foreignField: 'user',
  justOne: true,
});

UserSchema1.virtual('terminal', {
  ref: 'MerchantTerminal',
  localField: '_id',
  foreignField: 'user',
  justOne: true,
});

UserSchema1.virtual('merchant', {
  ref: 'Merchant',
  localField: '_id',
  foreignField: 'user',
  justOne: true,
});

// virtual populate with accounts
UserSchema1.virtual('accounts', {
  ref: 'Account',
  localField: '_id',
  foreignField: 'user',
});

UserSchema1.virtual('shetab', {
  ref: 'CardManagement',
  localField: '_id',
  foreignField: 'user',
});

UserSchema1.virtual('history', {
  ref: 'LoginHistory',
  localField: '_id',
  foreignField: 'user',
});

UserSchema1.virtual('acl', {
  ref: 'Acl',
  localField: '_id',
  foreignField: 'user',
  justOne: true,
});

UserSchema1.plugin(mongoosePaginate);
UserSchema1.plugin(mongooseAggregatePaginate);

new MongooseAutoIncrementID(UserSchema1, 'User', {
  field: 'account_no',
  unique: true,
});

export const UserSchema = UserSchema1;
