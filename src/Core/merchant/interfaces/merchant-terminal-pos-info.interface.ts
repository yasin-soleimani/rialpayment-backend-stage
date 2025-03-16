import { Document, Types } from 'mongoose';

export interface MerchantTerminalPosInfo {
  terminal: any;
  modelname: string;
  serial: string;
  mac: string;
  clientid: string;
}

export interface MerchantTerminalPosInfoDocument extends Readonly<MerchantTerminalPosInfo>, Document {}
