import { Injectable, Inject } from '@vision/common';
import { FileManagerModel, FileManagerModelSchema } from './models/file-manager.model';
import { FileManagerStatusEnum } from './enums/file-manager-status-enum';
import { PaginateModel, PaginateResult } from '../../utils/types.util';
import { FilterQuery } from 'mongoose';

@Injectable()
export class FileManagerCoreService {
  constructor(@Inject('FileManagerModel') private readonly fileManagerModel: PaginateModel<FileManagerModelSchema>) {}

  async create(data: FileManagerModel): Promise<FileManagerModelSchema> {
    return this.fileManagerModel.create(data);
  }

  async updateStatus(id: string, status: FileManagerStatusEnum) {
    return this.fileManagerModel.findOneAndUpdate({ _id: id }, { $set: { status } });
  }

  async getFilesNoQr(
    user: string,
    page: number,
    filter: FilterQuery<FileManagerModel>
  ): Promise<PaginateResult<FileManagerModel>> {
    return this.fileManagerModel.paginate(
      { user: user, ...filter },
      { populate: 'group', page, limit: 50, sort: { createdAt: -1 }, lean: true }
    );
  }
}
