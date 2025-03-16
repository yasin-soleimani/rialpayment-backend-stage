import { Document } from 'mongoose';

export interface LeasingInfo {
  leasingUser: any;
  logo: string;
  title: string;
  description: string;
}

export interface LeasingInfoDocument extends Readonly<LeasingInfo>, Document {}
