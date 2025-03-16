import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-aggregate-paginate';

const schema = new mongoose.Schema(
  {
    remainCount: { type: Number, default: 0 },
    totalCount: { type: Number, default: 0 },
    group: { type: mongoose.SchemaTypes.ObjectId, ref: 'Group' },
    terminals: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'MerchantTerminal' }],
    expire: String,
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    daysofweek: [{ type: Number }],
    title: { type: String },
    canUseMultiTime: { type: Boolean, default: false },
    card: { type: mongoose.SchemaTypes.ObjectId, ref: 'Card' },
  },
  {
    id: false,
    timestamps: true,
  }
);
schema.plugin(mongoosePaginate);
export const TicketsSchemaSchema = schema;
