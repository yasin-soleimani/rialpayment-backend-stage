import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';
import * as mongooseAggregatePaginate from 'mongoose-aggregate-paginate';

const PSPRequestSchema1 = new mongoose.Schema(
  {
    CommandID: { type: Number, required: true },
    TraxID: { type: Number, required: true },
    CardNum: { type: Number, required: true },
    TermID: { type: Number, required: true },
    TrnAmt: { type: Number },
    Merchant: { type: Number, required: true },
    ReceiveDT: { type: String, required: true },
    Track2: { type: String },
    TermType: String,
    Data: [{ title: String, amount: String }],
    inCome: [
      {
        sheba: String,
        incomeAmt: Number,
      },
    ],
    req: String,
    RsCode: Number,
  },
  { timestamps: true }
);

PSPRequestSchema1.plugin(mongoosePaginate);
PSPRequestSchema1.plugin(mongooseAggregatePaginate);

export const PSPRequestSchema = PSPRequestSchema1;
