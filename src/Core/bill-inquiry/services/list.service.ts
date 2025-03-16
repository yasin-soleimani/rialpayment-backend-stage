import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  successOpt,
  successOptWithDataNoValidation,
} from '@vision/common';
import { BillInquiryListDto } from '../dto/list.dto';
import { BillInquiryCommonService } from './common.service';

@Injectable()
export class BillInquiryListCoreService {
  constructor(private readonly commonService: BillInquiryCommonService) {}

  async getList(userid: string): Promise<any> {
    const data = await this.commonService.getList(userid);
    return successOptWithDataNoValidation(data);
  }

  async deleteByUserId(id: string, userid: string): Promise<any> {
    const data = await this.commonService.getListInfoByUserIdAndId(id, userid);
    if (!data) throw new NotFoundException('یافت نشد');

    const deleteId = await this.commonService.delete(id);
    if (!deleteId) throw new InternalServerErrorException();

    return successOpt();
  }

  async addNew(getInfo: BillInquiryListDto): Promise<any> {
    const isExist = await this.commonService.getListInfoByUserIdAndBillId(getInfo.id, getInfo.user);
    if (isExist) return isExist;

    const data = await this.commonService.addNewList(getInfo);
    if (!data) throw new InternalServerErrorException();

    return data;
  }
}
