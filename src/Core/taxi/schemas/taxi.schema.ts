import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';
import * as aggregatePaginate from 'mongoose-aggregate-paginate';

const schema = new mongoose.Schema(
  {
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    paid: { type: Boolean, default: false },
    referrer: { type: String },
    sepidPaid: { type: Boolean, default: false },
    instituteId: { type: Number },
    terminalID: { type: Number },
    amount: { type: Number, default: null },
    entityId: { type: String, default: null },
    taxiInformation: { type: Object, default: null },
    payInformation: { type: Object, default: null },
  },
  { timestamps: true }
);
schema.plugin(mongoosePaginate);
schema.plugin(aggregatePaginate);
export const TaxiSchema = schema;
