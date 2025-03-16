import * as mongoose from 'mongoose';

export const BillInquiryListSchema = new mongoose.Schema({
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
  },
  id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
  },
  type: {
    type: Number,
  },
  status: {
    type: Boolean,
    default: true,
  },
});
