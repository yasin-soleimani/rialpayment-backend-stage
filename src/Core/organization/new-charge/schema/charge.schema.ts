import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';

const ChargeSchema = new mongoose.Schema(
  {
    from: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    card: { type: mongoose.SchemaTypes.ObjectId, ref: 'Card' },
    description: { type: String },
    in: { type: Number },
    out: { type: Number },
    remain: { type: Number, default: 0 },
    pool: { type: mongoose.SchemaTypes.ObjectId, ref: 'OrganizationPool' }
  },
  { timestamps: true }
);

ChargeSchema.plugin(mongoosePaginate);
export const OrganizationNewChargeSchema = ChargeSchema;
