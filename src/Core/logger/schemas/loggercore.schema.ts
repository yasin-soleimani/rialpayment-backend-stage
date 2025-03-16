import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';

const LoggerSchema1 = new mongoose.Schema(
  {
    title: { type: String },
    ref: { type: String },
    amount: { type: Number },
    status: { type: Boolean },
    from: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    to: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    senderbalance: { type: Number },
    receivebalance: { type: Number },
    mobile: Number,
  },
  { timestamps: true }
);

LoggerSchema1.index({ title: 'text', ref: 'text', amount: 'text', createdAt: 'text' });
LoggerSchema1.plugin(mongoosePaginate);

export const LoggerSchema = LoggerSchema1;
