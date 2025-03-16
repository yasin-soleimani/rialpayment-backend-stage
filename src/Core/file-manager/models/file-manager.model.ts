import { Document } from 'mongoose';
import { FileManagerTypesEnum } from '../enums/file-manager-types-enum';
import { FileManagerStatusEnum } from '../enums/file-manager-status-enum';

export interface FileManagerModel {
  _id?: string;
  type: FileManagerTypesEnum;
  path: string;
  status: FileManagerStatusEnum;
  group?: string | any;
  additionalType?: number;
  user: string | any;
  description: string;
  createdAt?: string;
}

export type FileManagerModelSchema = Document & FileManagerModel;
