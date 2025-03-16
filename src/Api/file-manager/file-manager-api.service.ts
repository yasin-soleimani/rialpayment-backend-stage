import { Injectable, successOptWithPagination } from '@vision/common';
import { FileManagerCoreService } from '../../Core/file-manager/file-manager.service';
import { FileManagerTypesEnum } from '../../Core/file-manager/enums/file-manager-types-enum';
import { FileManagerStatusEnum } from '../../Core/file-manager/enums/file-manager-status-enum';
import { FileManagerModel } from '../../Core/file-manager/models/file-manager.model';

@Injectable()
export class FileManagerApiService {
  constructor(private readonly fileManagerService: FileManagerCoreService) {}

  async getFilter(
    user: string,
    page: number,
    body: { group?: string; type: FileManagerTypesEnum; status: FileManagerStatusEnum; id: string }
  ) {
    const filter: Partial<FileManagerModel> = {};
    if (body.group) filter.group = body.group;
    if (body.type) filter.type = body.type;
    if (body.status) filter.status = body.status;
    if (body.id) filter._id = body.id;
    const data = await this.fileManagerService.getFilesNoQr(
      user,
      page,
      !!filter.type || !!filter._id ? filter : { ...filter, type: { $not: { $eq: FileManagerTypesEnum.GROUP_QR } } }
    );

    const arr = [];
    for (const item of data.docs) arr.push({ ...item, path: item.path ? process.env.SITE_URL_EXCEL + item.path : '' });
    return successOptWithPagination({ ...data, docs: arr });
  }
}
