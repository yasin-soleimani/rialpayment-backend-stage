import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';

const CategorySchema1 = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    type: { type: Number, default: 1 },
  },
  { timestamps: true }
);

CategorySchema1.plugin(mongoosePaginate);

export const CategorySchema = CategorySchema1;
