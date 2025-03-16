import { Injectable, successOptWithDataNoValidation, successOptWithPagination } from '@vision/common';
import { CreditorSubjectCoreService } from '../../../Core/creditor/services/creditor-subject.service';

@Injectable()
export class CreditorSubjectApiService {
  constructor(private readonly subjectService: CreditorSubjectCoreService) {}

  async getListByUserId(userid: string, page: number): Promise<any> {
    const data = await this.subjectService.getList(userid, page);
    return successOptWithPagination(data);
  }
}
