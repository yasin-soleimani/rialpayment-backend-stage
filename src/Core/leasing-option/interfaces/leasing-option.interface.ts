import { Document } from "mongoose"

export interface LeasingOption {
  leasingUser: any;
  status: boolean;
  visible: boolean;
  amount: number;
  months: number;
  interest: number;
  isCustomizable: boolean;
  customAmount: number | null;
  minCustomAmount: number | null;
  maxCustomAmount: number | null;
  title: string;
  description: string;
  tenDayPenalty: number;
  twentyDayPenalty: number;
}

export interface LeasingOptionDocument extends Readonly<LeasingOption>, Document {
}
