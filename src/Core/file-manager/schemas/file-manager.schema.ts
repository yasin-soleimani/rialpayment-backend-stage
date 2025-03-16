import * as mongoose from 'mongoose';
import * as mongooseAggregatePaginate from 'mongoose-aggregate-paginate';
import * as mongoosePaginate from 'mongoose-paginate';
import { FileManagerStatusEnum } from '../enums/file-manager-status-enum';

const schema = new mongoose.Schema(
  {
    type: Number,
    path: String,
    user: { type: mongoose.Types.ObjectId, ref: 'User' },
    group: { type: mongoose.Types.ObjectId, ref: 'Group' },
    additionalType: { type: Number, default: -1 },
    status: { type: Number, default: FileManagerStatusEnum.PENDING },
    description: String,
  },
  {
    id: false,
    timestamps: true,
  }
);

schema.index({ type: 1 });
schema.index({ user: 1 });
schema.index({ group: 1 });
schema.index({ createdAt: 1 });
schema.plugin(mongoosePaginate);
schema.plugin(mongooseAggregatePaginate);
export const fileManagerSchema = schema;
