import { Injectable, InternalServerErrorException, successOpt, successOptWithPagination } from '@vision/common';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { CreditorSubjectCoreService } from '../../../Core/creditor/services/creditor-subject.service';
import { CreditorSubjectDto } from '../dto/subject.dto';

@Injectable()
export class CreditorSubjectBackofficeService {
  constructor(private readonly subjectService: CreditorSubjectCoreService) {}

  async addNew(getInfo: CreditorSubjectDto, ref: string): Promise<any> {
    if (isEmpty(getInfo.title)) throw new FillFieldsException();
    if (getInfo.title.length < 4) throw new UserCustomException('عنوان باید بیش از ۳ کارکتر باشد', false);
    const data = await this.subjectService.addNew(
      getInfo.user,
      getInfo.title,
      ref,
      getInfo.name,
      getInfo.group,
      getInfo.percent
    );
    if (!data) throw new InternalServerErrorException();

    return successOpt();
  }

  async changeStatus(getInfo: CreditorSubjectDto): Promise<any> {
    const data = await this.subjectService.getInfoById(getInfo.id);
    if (!data) throw new UserCustomException('یافت نشد', false, 404);

    const status = await this.subjectService.changeStatus(getInfo.id, getInfo.status);
    if (!status) throw new InternalServerErrorException();

    return successOpt();
  }

  async delete(getInfo: CreditorSubjectDto): Promise<any> {
    const data = await this.subjectService.getInfoById(getInfo.id);
    if (!data) throw new UserCustomException('یافت نشد', false, 404);

    const deleted = await this.subjectService.delete(getInfo.id);
    if (!deleted) throw new InternalServerErrorException();

    return successOpt();
  }

  async getList(user: string, page: number): Promise<any> {
    const data = await this.subjectService.getList(user, page);
    return successOptWithPagination(data);
  }
}
