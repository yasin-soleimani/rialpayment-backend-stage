import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';

const WageSchema1 = new mongoose.Schema(
  {
    total: { type: Number },
    amount: { type: Number },
    wage: { type: Number },
    wagetype: { type: Number },
    traxtype: { type: Number },
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    merchantwage: { type: Number },
    merchantref: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    cardwage: { type: Number },
    cardref: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    agent: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    agentwage: { type: Number },
    invoiceid: { type: String },
    log: { type: mongoose.SchemaTypes.ObjectId, ref: 'Logger' },
  },
  { timestamps: true }
);

WageSchema1.plugin(mongoosePaginate);

export const WageSchema = WageSchema1;
