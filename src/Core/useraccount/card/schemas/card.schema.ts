import * as mongoose from 'mongoose';
import * as mongoosePaginateAggregate from 'mongoose-aggregate-paginate';
import * as mongoosePaginate from 'mongoose-aggregate-paginate';

const CardSchema1 = new mongoose.Schema(
  {
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    cardno: { type: Number, unique: true },
    pin: String,
    expire: String,
    cvv2: Number,
    status: Boolean,
    code: String,
    secpin: String,
    type: { type: Number, default: 100 },
    amount: { type: Number, default: 0 },
    owner: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    group: { type: mongoose.SchemaTypes.ObjectId, ref: 'Group' },
    serial: { type: String, unique: true },
    registerd: Boolean,
    data: String,
    iv: { type: String }
  },
  { timestamps: true }
);

CardSchema1.plugin(mongoosePaginate);
CardSchema1.plugin(mongoosePaginateAggregate);

export const CardSchema = CardSchema1;
