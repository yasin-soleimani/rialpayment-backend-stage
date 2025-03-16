import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';

const BaskeLotterySchema1 = new mongoose.Schema(
  {
    store: { type: mongoose.Types.ObjectId, ref: 'BasketStore' },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    status: { type: Boolean, default: true },
    winners: [
      {
        fullName: { type: String, required: true },
        mobile: { type: String, required: true },
        amount: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);
BaskeLotterySchema1.methods.getMaskedMobiles = function () {
  for (const item in this.winners) {
    this.winners[item]['mobile'] = maskPhoneNumber(this.winners[item]['mobile']);
  }
  return this;
};
BaskeLotterySchema1.plugin(mongoosePaginate);

function maskPhoneNumber(phoneNumber: string) {
  return phoneNumber.replace(/\d(?!\d{7})(?=\d{4})/gm, '*');
}
export const BasketLotterySchema = BaskeLotterySchema1;
