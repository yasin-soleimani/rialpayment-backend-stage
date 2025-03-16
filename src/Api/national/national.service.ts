import {
  faildOpt,
  Injectable,
  InternalServerErrorException,
  successOpt,
  successOptWithDataNoValidation,
  successOptWithPagination,
} from '@vision/common';
import { NationalCoreService } from '../../Core/national/services/national.service';
import { NationalApiDto } from './dto/national.dto';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { timestamoToISO } from '@vision/common/utils/month-diff.util';
import { NationalUploadImgApiService } from './services/upload-img.service';
import { NationalGetListModel } from './function/model.function';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';

@Injectable()
export class NationalApiService {
  constructor(
    private readonly nationalService: NationalCoreService,
    private readonly uploadSerivce: NationalUploadImgApiService
  ) {}

  async submit(getInfo: NationalApiDto): Promise<any> {
    const info = await this.nationalService.getInfo(getInfo.id);
    if (info) {
      if (info.status == 2) throw new UserCustomException('مجاز به ویرایش نمی باشید');
    }
    const data = await this.nationalService.addNew(getInfo);

    if (!isEmpty(getInfo.visaexpire)) getInfo.visaexpire = timestamoToISO(Number(getInfo.visaexpire));
    getInfo.birthdate = timestamoToISO(Number(getInfo.birthdate));
    if (!data) throw new InternalServerErrorException();
    return successOptWithDataNoValidation(data._id);
  }

  async uploadImg(getInfo, req, userid: string): Promise<any> {
    await this.checkAuth(getInfo.id, userid);
    if (!req.files) return successOpt();
    const field = req.files;
    const it = Object.keys(field);
    let counter = 0;
    for (const info of it) {
      const img = await this.uploadSerivce.uploadImg(field[info]);
      this.nationalService.setDoc(getInfo.id, info, img);
      counter++;
    }
    if (counter < it.length) return faildOpt();
    return successOpt();
  }

  async getList(userid: string, page: number): Promise<any> {
    const query = { ref: userid };
    const data = await this.nationalService.getList(query, page);
    data.docs = NationalGetListModel(data.docs);
    return successOptWithPagination(data);
  }

  async update(getInfo: NationalApiDto, userid: string): Promise<any> {
    await this.checkAuth(getInfo.id, userid);
    const info = await this.nationalService.getInfo(getInfo.id);
    if (info.status == 2) throw new UserCustomException('مجاز به ویرایش نمی باشید');
    getInfo.ref = userid;
    if (getInfo.otherresidencetype == 'null') delete getInfo.otherresidencetype;
    return this.nationalService
      .update(getInfo)
      .then((res) => {
        if (!res) return faildOpt();
        return successOptWithDataNoValidation(res._id);
      })
      .catch((err) => {
        throw new InternalServerErrorException();
      });
  }

  async changeStatus(id: string, status: number, descriprion: string, userid: string): Promise<any> {
    await this.checkAuth(id, userid);
    let descrip = descriprion;
    if (status == 2) descrip = 'کاربر تایید شد';
    return this.nationalService
      .changeStatus(id, status, descrip)
      .then((res) => {
        if (!res) return faildOpt();
        return successOpt();
      })
      .catch((err) => {
        throw new InternalServerErrorException();
      });
  }

  private async checkAuth(id: string, userid: string): Promise<any> {
    const info = await this.nationalService.getInfo(id);
    if (!info) throw new UserCustomException('یافت نشد', false, 404);
    if (info.ref != userid) throw new UserCustomException('شما به این کاربر دسترسی ندارید', false, 401);
  }
}
