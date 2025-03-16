import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';

const BasketImagesSchema1 = new mongoose.Schema(
  {
    barcode: { type: String },
    imageLink: { type: String },
    category: { type: mongoose.Types.ObjectId, ref: 'BasketCategory' },
    productName: { type: String },
  },
  { timestamps: true }
);

BasketImagesSchema1.plugin(mongoosePaginate);

export const BasketImagesSchema = BasketImagesSchema1;
