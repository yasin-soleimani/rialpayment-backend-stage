import * as mongoose from 'mongoose';
import { IpgSchema } from '../../Core/ipg/schemas/ipgcore.schema';
const ipgModel = mongoose.model('Ipg', IpgSchema);

export async function submitIpg(terminalid: number): Promise<any> {
  return ipgModel.create({ terminalid: terminalid });
}
