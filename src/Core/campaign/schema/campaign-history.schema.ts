import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';

export const CampaignHistorySchema = new mongoose.Schema({
  campaign: { type: mongoose.SchemaTypes.ObjectId, ref: '' },
  user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
  amount: { type: Number },
  ref: { type: String }
}, { timestamps: true })

CampaignHistorySchema.plugin(mongoosePaginate);