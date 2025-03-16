import { Document } from 'mongoose';
import mongoose from 'mongoose';

export interface UserModel {
  _id?: string | mongoose.Types.ObjectId;
  mobile: number;
  nationalcode?: string;
  title?: string;
  password?: string;
  fullname?: string;
  account_no?: number;
}

export interface MerchantShareModel {
  shareFromUser: string | UserModel;
  shareToUser: string | UserModel;
  sharedMerchant: string | any;
  accepted?: boolean;
  deleted?: boolean;
  deleteRequested?: boolean;
}

export interface MerchantShareModelSchema extends Document, MerchantShareModel {}
