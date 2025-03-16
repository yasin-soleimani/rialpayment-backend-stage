import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';

const BasketShopSchema1 = new mongoose.Schema(
  {
    merchantuser: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    store: { type: mongoose.SchemaTypes.ObjectId, ref: 'BasketStore' },
    invoiceid: { type: String },
    devicetype: { type: String },
    referer: { type: String },
    isHyper: { type: Boolean, default: false },
    isJustMyShop: { type: Boolean, default: false },
    basket: [
      {
        id: { type: mongoose.SchemaTypes.ObjectId, ref: 'BasketProduct' },
        title: { type: String },
        qty: { type: Number, required: true },
        qtyRatio: { type: Number, default: 1 },
        price: { type: Number },
        total: { type: Number },
        type: { type: Number },
        details: {
          type: { size: String, color: String, price: Number },
          default: null,
        },
        options: {
          type: [
            {
              title: { type: String },
              price: { type: Number },
            },
          ],
          default: [],
        },
      },
    ],
    deliveryOption: {
      title: String,
      amount: Number,
      description: String,
      id: Number,
    },
    deliveryTime: { type: mongoose.SchemaTypes.ObjectId, ref: 'BasketDeliveryTime', default: null },
    deliveryDate: { type: Date, default: null },
    address: { type: mongoose.SchemaTypes.ObjectId, ref: 'BasketAddress' },
    total: { type: Number },
    status: { type: Number, default: 1 },
    token: { type: String },
    cashOnDelivery: { type: Boolean, default: false },
    paid: { type: Boolean, default: false },
    issuedDeliveryPrice: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

BasketShopSchema1.plugin(mongoosePaginate);
BasketShopSchema1.virtual('merchant', {
  ref: 'BasketStore',
  localField: 'merchantuser',
  foreignField: 'user',
  justOne: true,
});
export const BasketShopSchema = BasketShopSchema1;
