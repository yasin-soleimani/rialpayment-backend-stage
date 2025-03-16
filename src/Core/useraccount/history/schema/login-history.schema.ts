import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';

const LoginHistorySchema1 = new mongoose.Schema(
  {
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    devicetype: String,
    deviceinfo: String,
    ip: String,
  },
  { timestamps: true }
);

LoginHistorySchema1.plugin(mongoosePaginate);

export const LoginHistorySchema = LoginHistorySchema1;
