import { Schema, Types } from 'mongoose';
import { LeasingRefStatusEnum } from '../enums/leasing-ref-status.enum';
import * as mongoosePaginate from 'mongoose-paginate';
import * as mongooseAggregatePaginate from 'mongoose-aggregate-paginate';

const schema = new Schema(
  {
    clubUser: { type: Types.ObjectId, ref: 'User', required: true },
    leasingUser: { type: Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      default: LeasingRefStatusEnum.PENDING,
      enum: [LeasingRefStatusEnum.PENDING, LeasingRefStatusEnum.DECLINED, LeasingRefStatusEnum.ACCEPTED],
      required: true,
    },
    declineReasons: {
      type: [
        {
          rejectedBy: {
            type: Types.ObjectId,
            ref: 'User',
            required: true,
          },
          message: {
            type: String,
            maxlength: 1000,
            default: '',
          },
          date: {
            type: Date,
            required: true,
          },
        },
      ],
    },
    reformsDescriptions: {
      type: [
        {
          message: {
            type: String,
            maxlength: 1000,
            default: '',
          },
          date: {
            type: Date,
            required: true,
          },
        },
      ],
    },
    show: {
      type: Boolean,
      default: false,
    },
    public: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

schema.index({ clubUser: 1, leasingUser: 1 }, { unique: true });
schema.plugin(mongoosePaginate);
schema.plugin(mongooseAggregatePaginate);

export const LeasingRefSchema = schema;
