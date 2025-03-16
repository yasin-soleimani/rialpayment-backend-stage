import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';

export const CampaignSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User'
  },
  status: {
    type: Boolean,
    default: true
  },
  start: {
    type: Date,
    required: true
  },
  expire: {
    type: Date,
    required: true
  },
  campType: {
    type: Number,
    default: 1,
  },
  campStart: {
    type: Date,
  },
  campEnd: {
    type: Date
  },
  type: {
    type: Number,
    default: 1
  },
  purchaseCount: {
    type: Number,
    default: 0
  },
  purchaseTotalAmount: {
    type: Number
  },
  incType: {
    type: Number,
    default: 1
  },
  amount: {
    type: Number,
    default: 10000
  },
  terminals: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'MerchantTerminal' }],
  maxUser: { type: Number, default: 0 }
}, {
  timestamps: true
});

CampaignSchema.plugin(mongoosePaginate);