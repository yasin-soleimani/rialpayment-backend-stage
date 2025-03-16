import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';

const InvoiceSchemaTmp = new mongoose.Schema(
  {
    type: { type: Number, required: true },
    date: { type: Date },
    invoiceno: { type: Number, required: true },
    fullname: { type: String, required: true },
    tel: { type: Number },
    fax: { type: Number },
    address: { type: String },
    nationalcode: { type: String },
    economiccode: { type: String },
    postalcode: { type: String },
    registercode: { type: String },
    details: {
      totalwage: { type: Number },
      totalcompanywage: { type: Number },
      totalagentwage: { type: Number },
      totalpayamount: { type: Number },
      totaltax: { type: Number },
      totalpureamount: { type: Number },
    },
    paytype: { type: Number, default: 1 },
    description: { type: String, default: ' ' },
    cancel: { type: Boolean, default: false },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

InvoiceSchemaTmp.virtual('items', {
  ref: 'InvoiceDetails',
  localField: '_id',
  foreignField: 'invoice',
  justOne: true,
});
InvoiceSchemaTmp.plugin(mongoosePaginate);

export const InvoiceSchema = InvoiceSchemaTmp;
