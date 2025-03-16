import * as mongoose from 'mongoose';
import { MipgSchema } from '../../Core/mipg/schemas/mipg.schema';
import { MipgDirectSchema } from '../../Core/mipg/schemas/mipg-direct.schema';
import { IpgSchema } from '../../Core/ipg/schemas/ipgcore.schema';
import { async } from 'rxjs/internal/scheduler/async';
const mipgModel = mongoose.model('Mipg', MipgSchema);
const mipgDirectModel = mongoose.model('MipgDirects', MipgDirectSchema);
const ipgModel = mongoose.model('Ipg', IpgSchema);

export async function getMerchantInfo(terminalid: number): Promise<any> {
  return mipgModel.findOne({ terminalid: terminalid }).populate('direct');
}

export async function ipgWSDLInsert(userid, ref, invoiceid, amount, karmozd, type, callback, additional) {
  return ipgModel.create({
    user: userid,
    launch: true,
    ref: ref,
    amount: amount,
    karmozd: karmozd,
    type: type,
    payload: additional,
    direct: true,
    callbackurl: callback,
    invoiceid: invoiceid,
  });
}

export async function ipgWSDLUpdate(token, rrn, respcode, respmsg) {
  return ipgModel.findOneAndUpdate(
    { token: token },
    {
      details: {
        rrn: rrn,
        respcode: respcode,
        respmsg: respmsg,
      },
    }
  );
}
