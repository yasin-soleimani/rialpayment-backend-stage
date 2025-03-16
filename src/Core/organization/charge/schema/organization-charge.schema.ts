import * as mongoose from 'mongoose';

export const OrganizationChargeSchema = new mongoose.Schema(
  {
    by: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    organ: { type: mongoose.SchemaTypes.ObjectId, ref: 'OrganizationStrategy' },
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    card: { type: mongoose.SchemaTypes.ObjectId, ref: 'Card' },
    amount: Number,
  },
  { timestamps: true }
);
