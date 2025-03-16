import {
  Injectable,
  NotFoundException,
  successOptWithPagination,
  InternalServerErrorException,
  successOpt,
  successOptWithDataNoValidation,
  faildOpt,
  faildOptWithData,
} from '@vision/common';
import { IpgCoreService } from '../../Core/ipg/ipgcore.service';
import { MipgCoreService } from '../../Core/mipg/mipg.service';
import { MipgPardakhtyariService } from '../../Core/mipg/services/pardakhtyari';
import { MipgSharingService } from '../../Core/mipg/services/mipg-sharing.service';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { MipgDirectCoreService } from '../../Core/mipg/services/mipg-direct.service';
import { MipgDirectApiDto } from './dto/direct-mipg.dto';
import { MipgAuthService } from '../../Core/mipg/services/mipg-auth.service';
import { AclCoreService } from '../../Core/acl/acl.service';
import { MipgVoucherCoreService } from '../../Core/mipg/services/mipg-voucher.service';

@Injectable()
export class MipgBackOfficeService {
  constructor(
    private readonly mipgService: MipgCoreService,
    private readonly ipgService: IpgCoreService,
    private readonly pardakhtyariService: MipgPardakhtyariService,
    private readonly mipgDirectService: MipgDirectCoreService,
    private readonly mipgAuthService: MipgAuthService,
    private readonly aclService: AclCoreService,
    private readonly mipgVoucherService: MipgVoucherCoreService,
    private readonly mipgSharingService: MipgSharingService
  ) {}

  listTransform(data) {
    return {
      status: 200,
      success: true,
      message: 'عملیات با موفقیت انجام شد',
      data: data.docs,
      total: data.total,
      limit: data.limit,
      page: data.page,
      pages: data.pages,
    };
  }

  static loginSuccess(user: any, token: any) {
    return {
      status: 200,
      success: true,
      message: 'کاربر با موفقیت وارد شد',
    };
  }

  static transformSuccess() {
    return {
      success: true,
      status: 200,
      message: 'ثبت نام با موفقیت انجام شد',
    };
  }

  async getReport(getInfo, userid, page): Promise<any> {
    const acl = await this.aclService.getAclUSer(userid);
    let ipgInfo;
    if (acl.managecredit) {
      ipgInfo = await this.mipgService.getInfoByAdmin(getInfo.id);
    } else {
      ipgInfo = await this.mipgService.getInfoByAgent(userid, getInfo.id);
      if (!ipgInfo) throw new NotFoundException();
    }

    const data = await this.ipgService.getAgentReport(ipgInfo.terminalid, userid, page, getInfo.start, getInfo.end);
    return successOptWithPagination(data);
  }

  async addnewPardakhtyari(getInfo, userid): Promise<any> {
    const data = await this.pardakhtyariService.addNew(getInfo, userid);
    if (!data) throw new InternalServerErrorException();
    return successOpt();
  }

  async editPardakhtyari(getInfo): Promise<any> {
    const data = await this.pardakhtyariService.edit(getInfo);
    if (!data) throw new InternalServerErrorException();
    return successOpt();
  }

  async removePardakhtyari(id): Promise<any> {
    const data = await this.pardakhtyariService.remove(id);
    if (!data) throw new InternalServerErrorException();
    return successOpt();
  }

  async getPardakhtyariList(id: string): Promise<any> {
    const data = await this.pardakhtyariService.getList(id);
    return successOptWithDataNoValidation(data);
  }

  async changePasswordPardakhtyar(id: string, oldPassword: string, newPassword: string): Promise<any> {
    const data = await this.pardakhtyariService.changePassword(id, oldPassword, newPassword);
    if (!data) throw new InternalServerErrorException();
    return successOpt();
  }

  async makeDefault(id: string): Promise<any> {
    return this.pardakhtyariService.makeDefault(id);
  }

  async addSharing(getInfo, userid: string): Promise<any> {
    const terminalInfo = await this.mipgService.getMipgInfoByIdAndUserid(getInfo.id, userid);
    if (!terminalInfo) throw new UserCustomException('شما به این ترمینال دسترسی ندارید');

    if (isEmpty(getInfo.data)) throw new FillFieldsException();

    const data = JSON.parse(getInfo.data);
    for (const info of data) {
      this.mipgSharingService.addNew(getInfo.id, info.id, info.percent);
    }

    return successOpt();
  }

  async getSharingList(id: string, userid: string): Promise<any> {
    const terminalInfo = await this.mipgService.getMipgInfoByIdAndUserid(id, userid);
    if (!terminalInfo) throw new UserCustomException('شما به این ترمینال دسترسی ندارید');

    let output = await this.mipgSharingService.getList(id);
    return successOptWithDataNoValidation(output);
  }

  async getDirectList(mipg: string): Promise<any> {
    const data = await this.mipgDirectService.getList(mipg);
    return successOptWithDataNoValidation(data);
  }

  async addNewDirect(getInfo: MipgDirectApiDto): Promise<any> {
    return this.mipgDirectService
      .addnew(getInfo)
      .then((res) => {
        if (res) return successOpt();
        return faildOpt();
      })
      .catch((err) => {
        throw new InternalServerErrorException();
      });
  }

  async editDirect(getInfo: MipgDirectApiDto): Promise<any> {
    return this.mipgDirectService
      .edit(getInfo)
      .then((res) => {
        if (res) return successOpt();
        return faildOpt();
      })
      .catch((err) => {
        throw new InternalServerErrorException();
      });
  }

  async changeStatusDirect(id: string, status: boolean): Promise<any> {
    return this.mipgDirectService
      .chanegStatus(id, status)
      .then((res) => {
        if (res) return successOpt();
        return faildOpt();
      })
      .catch((err) => {
        throw new InternalServerErrorException();
      });
  }

  async submitVoucehr(getInfo): Promise<any> {
    return this.mipgVoucherService
      .addNew(getInfo)
      .then((res) => {
        if (!res) throw new InternalServerErrorException();
        return successOpt();
      })
      .catch((err) => {
        throw new InternalServerErrorException();
      });
  }

  async getVoucher(id: string): Promise<any> {
    const info = await this.mipgVoucherService.getInfo(id);
    if (!info)
      return successOptWithDataNoValidation({
        status: false,
        mipg: id,
        karmozd: 0,
        type: 0,
      });
    return successOptWithDataNoValidation(info);
  }

  async changeIsDirect(id: string, direct): Promise<any> {
    let status = true;
    if (direct == 'false' || direct == false) status = false;
    return this.mipgService
      .chnageIsDirect(id, status)
      .then((res) => {
        if (!res) throw new InternalServerErrorException();
        return successOpt();
      })
      .catch((err) => {
        throw new InternalServerErrorException();
      });
  }

  async changeWageType(id: string, type: number): Promise<any> {
    return this.mipgService
      .changeWageType(id, type)
      .then((res) => {
        if (!res) throw new InternalServerErrorException();
        return successOpt();
      })
      .catch((err) => {
        throw new InternalServerErrorException();
      });
  }

  async submitAuth(getInfo): Promise<any> {
    return this.mipgAuthService
      .addNew(getInfo.sitad, getInfo.mobile, getInfo.shahkar, getInfo.nahab, getInfo.id, getInfo.status)
      .then((res) => {
        if (!res) throw new InternalServerErrorException();
        return successOpt();
      })
      .catch((err) => {
        throw new InternalServerErrorException();
      });
  }

  async getAuthList(id: string, userid: string): Promise<any> {
    const data = await this.mipgAuthService.getInfoByMipg(id);
    if (!data)
      return faildOptWithData({
        status: false,
        nahab: false,
        mobile: false,
        sitad: false,
        shahkar: false,
      });
    return successOptWithDataNoValidation(data);
  }
}
