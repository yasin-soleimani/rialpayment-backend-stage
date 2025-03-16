import * as mongoose from 'mongoose';

export const BasketAddressSchema = new mongoose.Schema({
  deleted: { type: Boolean, default: false },
  province: { type: String },
  city: { type: String },
  address: { type: String },
  postalcode: { type: String, default: '' },
  fullname: { type: String },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  mobile: { type: String },
  user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
});
