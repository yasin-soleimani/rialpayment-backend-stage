import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';

const BasketCardsSchema1 = new mongoose.Schema(
  {
    product: { type: mongoose.SchemaTypes.ObjectId, ref: 'BasketProduct' },
    value: [{ type: String }],
    sold: { type: Boolean, default: false },
    reserve: { type: Boolean, default: false },
    shop: { type: mongoose.SchemaTypes.ObjectId, ref: 'BasketShop' },
  },
  { timestamps: true }
);

BasketCardsSchema1.plugin(mongoosePaginate);

export const BasketCardsSchema = BasketCardsSchema1;
