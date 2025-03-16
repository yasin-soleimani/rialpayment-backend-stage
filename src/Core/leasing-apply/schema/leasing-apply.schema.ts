import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';
import * as mongooseAggregatePaginate from 'mongoose-aggregate-paginate';
import { LeasingApplyStatusEnum } from '../enums/leasing-apply-status.enum';

const schema = new mongoose.Schema(
  {
    leasingUser: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    applicant: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    leasingOption: { type: mongoose.Types.ObjectId, ref: 'LeasingOption', required: true },
    deleted: { type: Boolean, default: false },
    form: {
      type: [
        {
          value: { type: String, default: '' },
          key: { type: String, default: '' },
          title: { type: String, default: '' },
          type: { type: String },
          required: { type: Boolean },
        },
      ],
    },
    status: {
      type: String,
      default: LeasingApplyStatusEnum.PENDING,
      enum: [
        LeasingApplyStatusEnum.PENDING,
        LeasingApplyStatusEnum.DECLINED,
        LeasingApplyStatusEnum.ACCEPTED_BY_LEASING,
        LeasingApplyStatusEnum.ACCEPTED,
      ],
      required: true,
    },
    declineReasons: {
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
      default: [],
    },
    confirmDescription: {
      type: {
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
      default: {
        message: '',
        date: null,
      },
    },
    isOnProgress: { type: Boolean, default: false },
    paidByLeasing: { type: Boolean, default: false },
    invoiceId: { type: String, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

schema.virtual('leasingInfo', {
  ref: 'LeasingInfo',
  localField: 'leasingUser',
  foreignField: 'leasingUser',
  justOne: true,
});

schema.plugin(mongoosePaginate);
schema.plugin(mongooseAggregatePaginate);

export const LeasingApplySchema = schema;
