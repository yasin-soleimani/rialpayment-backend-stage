import { Schema, Types } from 'mongoose';
import { LeasingFormTypeEnum } from '../enums/leasing-form-type.enum';

const schema = new Schema(
  {
    leasingUser: { type: Types.ObjectId, required: true, ref: 'User' },
    type: {
      type: String,
      enum: [
        LeasingFormTypeEnum.EMAIL,
        LeasingFormTypeEnum.FILE,
        LeasingFormTypeEnum.MOBILE,
        LeasingFormTypeEnum.NATIONAL_CODE,
        LeasingFormTypeEnum.TEXT,
      ],
      required: true,
    },
    title: { type: String, required: true, minlength: 3, maxlength: 128 },
    description: { type: String, required: false, default: '', maxlength: 512 },
    key: { type: String, required: true },
    required: { type: Boolean, default: false, required: true },
    deleted: { type: Boolean, default: false },
  },
  {
    toJSON: { virtuals: true },
    timestamps: true,
  }
);

export const leasingFormSchema = schema;
