import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';

const BasketProductSchema1 = new mongoose.Schema(
  {
    title: { type: String, required: true },
    qtyRatio: { type: Number, default: 1 },
    qty: { type: Number, default: 0 },
    qtyType: { type: Number, default: 1 },
    price: { type: Number, default: 0 },
    description: { type: String },
    img: { type: String },
    category: { type: mongoose.SchemaTypes.ObjectId, ref: 'BasketCategory' },
    categoryMap: { type: String, default: '/' },
    link: { type: String },
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    type: { type: Number },
    deleted: { type: Boolean, default: false },
    metaTitle: { type: String },
    metaDescription: { type: String },
    slug: { type: String },
    hasDetails: { type: Boolean, default: false },
    details: {
      type: [
        {
          size: String,
          color: String,
          qtyRatio: { type: Number, default: 1 },
          qtyType: { type: Number, default: 1 },
          qty: Number,
          price: Number,
          specialSell: {
            price: {
              type: Number,
              default: null,
            },
            from: {
              type: Date,
              default: null,
            },
            to: {
              type: Date,
              default: null,
            },
          },
        },
      ],
      default: [],
    },
    sp: { type: Boolean, default: false },
    specialSell: {
      price: {
        type: Number,
        default: null,
      },
      from: {
        type: Date,
        default: null,
      },
      to: {
        type: Date,
        default: null,
      },
    },
    multiOption: { type: Boolean, default: false },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

BasketProductSchema1.plugin(mongoosePaginate);
BasketProductSchema1.virtual('fields', {
  ref: 'BaksetProductCardField',
  localField: '_id',
  foreignField: 'product',
});

export const BasketProductSchema = BasketProductSchema1;
