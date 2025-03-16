import { Document } from "mongoose"
import { ObjectId } from "bson"
import { LeasingUserCredit } from "../../leasing-user-credit/interfaces/leasing-user-credit.interface"

export interface LeasingInstallments {
  leasingUserCredit: string | ObjectId | LeasingUserCredit;
  user: any;
  paid: boolean;
  amount: number;
  dueDate: any;
  paidDate: any;
  invoiceId: string;
  paidAmount: number;
}

export interface LeasingInstallmentsDocument extends Readonly<LeasingInstallments>, Document {
}
