import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';

const WageSystemSchema1 = new mongoose.Schema(
  {
    total: { type: Number },
    type: { type: Number },
    wage: {
      total: { type: Number },
      company: { type: Number },
      agent: { type: Number },
      merchant: { type: Number },
      type: { type: Number },
      wagenumber: { type: Number },
    },
    merchantinfo: {
      acceptor: { type: String },
      terminal: { type: String },
      type: { type: Number },
    },
    agent: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    merchant: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

WageSystemSchema1.plugin(mongoosePaginate);

export const WageSystemSchema = WageSystemSchema1;
