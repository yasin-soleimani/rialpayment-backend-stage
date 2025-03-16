import { Injectable, successOptWithDataNoValidation, successOptWithPagination } from '@vision/common';
import { IdentifyCoreService } from '../../Core/useraccount/identify/identify.service';
import { backofficeIdentifyReturnList } from './func/return.func';

@Injectable()
export class BackofficeIdentifyService {
  constructor(private readonly identifyService: IdentifyCoreService) {}

  async getList(page: number): Promise<any> {
    const data = await this.identifyService.getList(page);
    data.docs = await backofficeIdentifyReturnList(data.docs);
    return successOptWithPagination(data);
  }
}
