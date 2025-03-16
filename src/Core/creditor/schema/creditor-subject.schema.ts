import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';

const SubjectSchema = new mongoose.Schema(
  {
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    group: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'Group' }],
    title: { type: String },
    name: { type: String },
    percent: { type: Number },
    visible: { type: Boolean, default: true },
    status: { type: Boolean, default: true },
    ref: { type: mongoose.SchemaTypes.ObjectId, ref: 'User`' },
  },
  { timestamps: true }
);

SubjectSchema.plugin(mongoosePaginate);

export const CreditorSubjectSchema = SubjectSchema;
