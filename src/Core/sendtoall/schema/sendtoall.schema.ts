import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';

const SendtoallSchema1 = new mongoose.Schema(
  {
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    message: { type: String },
    type: { type: Number },
    mobile: { type: Number },
    fcm: { type: String },
    groupname: { type: String },
    gid: { type: mongoose.SchemaTypes.ObjectId, ref: 'Group' },
    ref: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    provider: { type: String, default: 'Asanak' },
    username: { type: String },
    password: { type: String },
    sourceno: { type: String },
    status: { type: String },
  },
  { timestamps: true }
);

SendtoallSchema1.plugin(mongoosePaginate);

export const SendtoallSchema = SendtoallSchema1;
