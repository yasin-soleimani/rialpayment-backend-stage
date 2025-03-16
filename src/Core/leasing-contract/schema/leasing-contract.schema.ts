import { Schema, Types } from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';
import * as mongooseAggregatePaginate from 'mongoose-aggregate-paginate';
import { LeasingInvestmentPeriodEnum } from '../enums/leasing-investment-period.enum';
import { LeasingContractStatusEnum } from '../enums/leasing-contract-status.enum';

const schema = new Schema(
  {
    title: { type: String, minlength: 5, maxlength: 64, required: true },
    deleted: { type: Boolean, default: false, requried: true },
    leasingRef: { type: Types.ObjectId, required: true, ref: 'LeasingRef' },
    status: {
      type: String,
      default: LeasingContractStatusEnum.PENDING,
      enum: [LeasingContractStatusEnum.ACCEPTED, LeasingContractStatusEnum.PENDING],
      required: true,
    },
    description: { type: String, maxlength: 1000 },
    leasingUser: { type: Types.ObjectId, ref: 'User', reuired: true },
    investmentAmount: { type: Number, required: true },
    remain: { type: Number, required: true },
    investmentPeriod: {
      type: String,
      default: LeasingInvestmentPeriodEnum.YEARLY,
      enum: [
        LeasingInvestmentPeriodEnum.MONTHLY,
        LeasingInvestmentPeriodEnum.EVERY_SIX_MONTH,
        LeasingInvestmentPeriodEnum.SEASONAL,
        LeasingInvestmentPeriodEnum.YEARLY,
      ],
      required: true,
    },
    startsAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
  },
  {
    toJSON: { virtuals: true },
    timestamps: true,
  }
);

schema.plugin(mongoosePaginate);
schema.plugin(mongooseAggregatePaginate);

export const LeasingContractSchema = schema;
