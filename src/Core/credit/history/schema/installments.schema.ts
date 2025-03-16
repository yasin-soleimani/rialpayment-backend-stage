import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';

const CreditInstallmentsSchema1 = new mongoose.Schema(
  {
    shopid: { type: mongoose.SchemaTypes.ObjectId, ref: 'CreditHistory' },
    paid: { type: Boolean, default: false },
    amount: Number,
    date: Date,
    paidamount: { type: Number, default: 0 },
    paiddate: Date,
    creditsrc: { type: mongoose.SchemaTypes.ObjectId, ref: 'UserCredit' },
  },
  { timestamps: true }
);

CreditInstallmentsSchema1.plugin(mongoosePaginate);

export const CreditInstallmentsSchema = CreditInstallmentsSchema1;
