import * as mongoose from 'mongoose';

const ClubSettingsSchema1 = new mongoose.Schema({
  _id: String,
  userreg: { type: Number, default: 10000 },
  merchantreg: { type: Number, default: 2500000 },
  cardchargepercent: { type: Number, default: 2 },
  personalpage: { type: Number, default: 10000000 },
  generategifcard: { type: Number, default: 30000000 },
  pergiftcard: { type: Number, default: 10000 },
  clubprice: { type: Number, default: 20000000 },
  clubprice2: { type: Number },
  customerwage: { type: Number, default: 30000000 },
  merchantwage: { type: Number },
  operator: { type: Number, default: 2000000 },
  ads: { type: Number, default: 1000 },
  giftcard: { type: Number, default: 3000000 },
  ticketsWage: { type: Number, default: 5000 },
});

export const SettingsClubSchema = ClubSettingsSchema1;
