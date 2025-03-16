import * as mongoose from 'mongoose';

const PSPDiscountSchema1 = new mongoose.Schema(
  {
    companywage: { type: Number, default: 0 },
    cardref: { type: Number, default: 0 },
    merchantref: { type: Number, default: 0 },
    nonebank: { type: Number, default: 0 },
    bankdisc: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    storeinbalance: { type: Number, default: 0 },
    organization: { type: Number, default: 0 },
    orgdetails: [
      {
        pool: { type: mongoose.SchemaTypes.ObjectId, ref: 'OrganizationPool' },
        amount: { type: Number },
      },
    ],
    lecredits: [
      {
        leasingUserCredit: { type: mongoose.SchemaTypes.ObjectId, ref: 'LeasingUserCredit' },
        amount: { type: Number },
      },
    ],
  },
  { timestamps: true }
);

export const PSPDiscountSchema = PSPDiscountSchema1;
