import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';

const MessagesSchema1 = new mongoose.Schema(
  {
    from: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    to: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    type: Number,
    title: { type: String, required: true },
    description: { type: String, required: true },
    isread: { type: Boolean, default: false },
  },
  { timestamps: true }
);

MessagesSchema1.plugin(mongoosePaginate);

export const MessagesSchema = MessagesSchema1;
