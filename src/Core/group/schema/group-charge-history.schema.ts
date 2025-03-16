import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-aggregate-paginate';

const GroupChargeHistorySchema1 = new mongoose.Schema({
  amount: Number,
  group: { type: mongoose.SchemaTypes.ObjectId, ref: 'Group' },
  terminals: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'MerchantTerminal' }],
  expire: Date,
  daysofweek: [{ type: Number }],
});

GroupChargeHistorySchema1.plugin(mongoosePaginate);
export const GroupChargeHistorySchema = GroupChargeHistorySchema1;
