import { Injectable } from '@vision/common';
import { HistoryFilterDto } from './dto/filter.dto';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { LoggercoreService } from '../../Core/logger/loggercore.service';

@Injectable()
export class HistoryService {
  constructor(private readonly loggerService: LoggercoreService) {}

  async filter(gteInfo: HistoryFilterDto, page, userid): Promise<any> {
    if (isEmpty(page)) page = 1;
  }

  async listHistory(req, userid): Promise<any> {}

  async getDup(): Promise<any> {
    return this.loggerService.getDuplicate();
  }

  transform(data) {
    return {
      status: 200,
      success: true,
      message: 'عملیات با موفقیت انجام شد',
      data: data.docs || '',
      total: data.total || '',
      limit: data.limit || '',
      page: data.page || '',
      pages: data.pages || '',
    };
  }
}
