import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';

const BillInquirySchema1 = new mongoose.Schema(
  {
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    status: { type: Boolean, default: false },
    type: { type: Number },
    amount: { type: Number },
    fullname: { type: String },
    address: { type: String },
    billid: { type: String },
    paymentid: { type: String },
    previousdate: { type: Date },
    currentdate: { type: Date },
    extrainfo: { type: String },
    description: { type: String },
    code: { type: String },
    mobile: { type: String },
    term: { type: String },
    paid: { type: Boolean, default: false },
    bankresponse: { type: String },
    ref: { type: String },
    referer: { type: String },
  },
  { timestamps: true }
);

BillInquirySchema1.plugin(mongoosePaginate);

export const BillInquirySchema = BillInquirySchema1;
