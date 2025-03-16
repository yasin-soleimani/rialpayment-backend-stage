import { Document } from 'mongoose';

export interface AppVersionsModel {
  _id?: string;
  version: number;
  fileName: string;
  versionString: string;
  force: boolean;
  isMain: boolean;
  createdAt?: string;
}

export type AppVersionsModelSchema = Document & AppVersionsModel;
