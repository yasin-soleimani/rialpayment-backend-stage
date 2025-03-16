import * as mongoose from 'mongoose';

const BasketCategorySchema1 = new mongoose.Schema(
  {
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    parent: { type: String, default: '/' },
    metaTitle: { type: String },
    metaDescription: { type: String },
    slug: { type: String },
    img: { type: String, default: '' },
    isHyperCat: { type: Boolean, default: false },
  },
  { timestamps: true }
);

BasketCategorySchema1.virtual('products', {
  ref: 'BasketProduct',
  localField: '_id',
  foreignField: 'category',
});

export const BasketCategorySchema = BasketCategorySchema1;
