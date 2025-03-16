import * as mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    referer: { type: String, required: true },
    selfDomain: { type: String },
    clubUser: { type: mongoose.Types.ObjectId, ref: 'User' },
    inAppPurchaseCallback: { type: String, required: true },
    chargeCallback: { type: String, required: true },
    leCreditInstallmentsCallbackUrl: { type: String, required: true, default: null },
    faqs: { type: String, default: 'https://rialpayment.ir/terms' },
    billCallback: { type: String, required: true },
    taxiCallback: { type: String, required: true },
    devicetype: { type: String },
    androidIntent: { type: String },
    manifestName: { type: String, required: true },
    manifestShortName: { type: String, required: true },
    manifestThemeColor: { type: String, default: '' },
    manifestIconsBasePath: { type: String, default: '' },
  },
  { timestamps: true, id: false }
);

schema.virtual('customerClub', {
  ref: 'CustomerClub',
  localField: 'clubUser',
  foreignField: 'owner',
  justOne: true,
});

export const ClubPwaSchema = schema;
