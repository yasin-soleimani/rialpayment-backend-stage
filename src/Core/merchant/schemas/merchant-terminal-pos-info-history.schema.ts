import { Schema, Types } from 'mongoose';
import * as paginate from 'mongoose-paginate';
import * as aggregatePaginate from 'mongoose-aggregate-paginate';

const schema = new Schema(
  {
    mac: { type: String, required: true },
    serial: { type: String, required: true },
    modelname: { type: String, required: true },
    user: { type: Types.ObjectId, required: true, ref: 'User' },
    lastTerminal: { type: Types.ObjectId, required: true, ref: 'MerchantTerminal' },
    message: { type: String, required: true, maxlength: 1024 },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

schema.plugin(paginate);
schema.plugin(aggregatePaginate);

export const MerchantTerminalPosInfoHistorySchema = schema;
