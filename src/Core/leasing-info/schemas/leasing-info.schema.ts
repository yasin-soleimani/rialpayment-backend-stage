import { Schema, Types } from 'mongoose';

const schema = new Schema(
  {
    leasingUser: { type: Types.ObjectId, required: true, ref: 'Users' },
    logo: { type: String, required: true },
    title: { type: String, maxlength: 128, requried: true, minlength: 3, unique: true },
    description: { type: String, maxlength: 512 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

export const leasingInfoSchema = schema;
