import { Injectable, InternalServerErrorException, successOpt, successOptWithPagination } from '@vision/common';
import { CreditorCoreService } from '../../../Core/creditor/services/creditor.service';
import { CreditorDto } from '../dto/creditor.dto';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';

@Injectable()
export class CreditorBackofficeService {
  constructor(private readonly creditorService: CreditorCoreService) {}

  async getList(id: string, page: number): Promise<any> {
    const data = await this.creditorService.getList(id, page);
    return successOptWithPagination(data);
  }

  async addNew(getInfo: CreditorDto): Promise<any> {
    const data = await this.creditorService.addNew(
      getInfo.subject,
      getInfo.amount,
      getInfo.description,
      getInfo.date,
      getInfo.type
    );
    if (!data) throw new InternalServerErrorException();

    return successOpt();
  }

  async changeStatus(getInfo: CreditorDto): Promise<any> {
    const data = await this.creditorService.getInfoById(getInfo.id);
    if (!data) throw new UserCustomException('یافت نشد', false, 404);

    const status = await this.creditorService.changeStatus(getInfo.id, getInfo.status);
    if (!status) throw new InternalServerErrorException();

    return successOpt();
  }

  async delete(getInfo: CreditorDto): Promise<any> {
    const data = await this.creditorService.getInfoById(getInfo.id);
    if (!data) throw new UserCustomException('یافت نشد', false, 404);

    const deleted = await this.creditorService.delete(getInfo.id);
    if (!deleted) throw new InternalServerErrorException();

    return successOpt();
  }
}
