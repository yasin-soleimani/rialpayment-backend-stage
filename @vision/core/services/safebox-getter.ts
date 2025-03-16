// import { AccountSchema } from 'src/Core/useraccount/account/schemas/cardcounter.schema';
// import { SafeboxSchema } from 'src/Core/safebox/schema/safebox.schema';
// import { LoggerSchema } from 'src/Core/logger/schemas/loggercore.schema';
// import * as mongoose from 'mongoose';
// import * as UniqueNumber from 'unique-number';

export async function safeboxUpdater(mobile, userid): Promise<any> {
  // mongoose.connect('mongodb://localhost:27017/vision');
  // const accountModel = mongoose.model('Account', AccountSchema);
  // const safeboxModel = mongoose.model('Safebox', SafeboxSchema);
  // const loggerModel = mongoose.model('loggerModel', LoggerSchema);
  // const uniqueNumber = new UniqueNumber(true);
  // const title = 'انتقال از صندوق امن '
  // const ref = 'Trans-' + uniqueNumber.generate();
  // const data = await safeboxModel.find( { mobile: mobile, status: true}, function(data) {
  //   if ( data ) {
  //     data.forEach( function (item, index) {
  //       accountModel.findOneAndUpdate( { user: userid, type: 'wallet' }, { $inc: { balance: item.amount} })
  //       loggerModel.create({ ref: ref, title: title, amount: item.amount, from: item.from, to: userid});
  //       safeboxModel.findOneAndUpdate( { _id: item._id}, { status: false});
  //     });
  //   }
  // }).exec();
  // console.log(data);
}