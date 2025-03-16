import * as mongoose from 'mongoose';

export const AppVersionsSchema = new mongoose.Schema({
  version: { type: Number, default: 0 },
  fileName: { type: String, default: 'rialpayment.apk' },
  versionString: { type: String, default: '0.0.0' },
  force: { type: Boolean, default: false },
  isMain: { type: Boolean, default: false },
});

AppVersionsSchema.index({ force: 1 });
AppVersionsSchema.index({ isMain: 1 });
