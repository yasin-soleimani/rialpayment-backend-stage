import { Schema } from 'mongoose';
import * as agregatePaginate from 'mongoose-aggregate-paginate';

const schema = new Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    block: {
      type: Boolean,
      default: false,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    leasingUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    leasingOption: {
      type: Schema.Types.ObjectId,
      ref: 'LeasingOption',
      required: true,
    },
    leasingApply: {
      type: Schema.Types.ObjectId,
      ref: 'LeasingApply',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

schema.index({ user: 1, leasingOption: 1, leasingApply: 1 }, { unique: true });
schema.plugin(agregatePaginate);

export const LeasingUserCreditSchema = schema;
