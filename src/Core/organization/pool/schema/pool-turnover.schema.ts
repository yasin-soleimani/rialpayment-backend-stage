import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';

const OrganizationPoolTurnOverSchemaTmp = new mongoose.Schema(
  {
    pool: { type: mongoose.SchemaTypes.ObjectId, ref: 'OrganizationPool' },
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    in: { type: Number, required: true },
    out: { type: Number, required: true },
    remain: { type: Number, required: true, default: 0 },
    card: { type: mongoose.SchemaTypes.ObjectId, ref: 'Card' },
    description: { type: String, required: true },
    ref: { type: String },
    visible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

OrganizationPoolTurnOverSchemaTmp.plugin(mongoosePaginate);

export const OrganizationPoolTurnOverSchema = OrganizationPoolTurnOverSchemaTmp;
