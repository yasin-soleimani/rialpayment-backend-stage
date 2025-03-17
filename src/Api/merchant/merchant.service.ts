import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  successOptWithPagination,
  successOpt,
  successOptWithDataNoValidation,
  faildOpt,
} from '@vision/common';
import { PspCoreService } from '../../Core/psp/psp/pspCore.service';
import { MerchantcoreService } from '../../Core/merchant/merchantcore.service';
import { GeneralService } from '../../Core/service/general.service';
import { UserMerchantDto } from './dto/merchant.dto';
import { UserService } from '../../Core/useraccount/user/user.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { MerchantTerminalDto } from './dto/newterminal.dto';
import * as uniqid from 'uniqid';
import { categoryManage } from '@vision/common/category/merchant-category';
import { shebaFinder } from '@vision/common/utils/sheba-finder.util';
import { ShabacoreService } from '../../Core/shaba/shabacore.service';
import { getIbanFromAsanPardakht } from '@vision/common/services/getMercgantIBAN.service';
import { isNull } from 'util';
import { MerchantCoreTerminalService } from '../../Core/merchant/services/merchant-terminal.service';
import { TerminalType } from '@vision/common/enums/terminalType.enum';
import { imageTransform } from '@vision/common/transform/image.transform';
import { SetTerminalToClubDto } from './dto/set-terminal-to-club.dto';
import { ClubCoreService } from '../../Core/customerclub/club.service';
import { MerchantTerminalShareServie } from '../../Core/merchant/services/merchant-terminal-share.service';
import { MerchantCounterCoreService } from '../../Core/merchant/services/counter.service';
import { MerchantTerminalPosInfoService } from '../../Core/merchant/services/merchant-terminal-pos-info.service';
import { AddPosDto } from '../../Backoffice/pos-management/dto/add-pos.dto';
import { MerchantTerminalPosInfoHistoryService } from '../../Core/merchant/services/merchant-terminal-pos-info-history.service';
import { MerchantShareService } from '../../Core/merchant/services/merchant-share.service';
import * as mongoose from 'mongoose';
import { UPLOAD_URI } from '../../__dir__';

@Injectable()
export class UserMerchantService {
  private category;
  constructor(
    private readonly pspCoreService: PspCoreService,
    private readonly merchantCoreService: MerchantcoreService,
    private readonly terminalCoreService: MerchantCoreTerminalService,
    private readonly generalService: GeneralService,
    private readonly userService: UserService,
    private readonly shebaService: ShabacoreService,
    private readonly clubService: ClubCoreService,
    private readonly shareService: MerchantTerminalShareServie,
    private readonly counterService: MerchantCounterCoreService,
    private readonly posCoreService: MerchantTerminalPosInfoService,
    private readonly posHistoryCoreService: MerchantTerminalPosInfoHistoryService,
    private readonly merchantShareService: MerchantShareService
  ) {
    this.category = new categoryManage();
  }

  async newMerchant(getInfo: UserMerchantDto, req: Request): Promise<any> {
    this.checkDto(getInfo);
    const user = await this.userService.findById(getInfo.user);
    const role = await this.generalService.getRole(req);
    if (!user) throw new UserCustomException('متاسفانه کاربر یافت نشد', false, 401);
    const psp = await this.pspCoreService.getPsp(getInfo.psp);
    if (psp.type == TerminalType.Mobile) {
      getInfo.merchantcode = new Date().getTime();
    }
    const img = await this.uploadPicture(req);
    getInfo.logo = img.logo;
    getInfo.img1 = img.img1;
    getInfo.img2 = img.img2;
    getInfo.img3 = img.img3;
    const counterData = await this.counterService.getMerchantCounter(getInfo);
    const data = await this.merchantCoreService.addNewMerchant(counterData, role);
    if (!data) throw new UserCustomException('متاسفانه عملیات با خطا مواجه شده است', false, 500);
    return this.successNewMerchantopt(data);
  }

  async updateMerchant(getInfo: UserMerchantDto, merchantcode, userid, req: Request): Promise<any> {
    if (isEmpty(merchantcode) || isEmpty(userid)) throw new FillFieldsException();
    const img = await this.uploadPicture(req);
    console.log(img, 'img');
    if (img.logo === null || !img.logo) {
      delete getInfo.logo;
    } else {
      getInfo.logo = img.logo;
    }
    if (img.img1 === null || !img.img1) {
      delete getInfo.img1;
    } else {
      getInfo.img1 = img.img1;
    }
    if (img.img2 === null || !img.img2) {
      delete getInfo.img2;
    } else {
      getInfo.img2 = img.img2;
    }
    if (img.img3 === null || !img.img3) {
      delete getInfo.img3;
    } else {
      getInfo.img3 = img.img3;
    }
    console.log(getInfo, 'getInfo');
    const data = await this.merchantCoreService.editMerchant(merchantcode, userid, getInfo);
    if (!data) throw new UserCustomException('متاسفانه عملیات با خطا مواجه شده است', false, 500);
    return this.successNewMerchantopt(data);
  }

  async updateTerminal(getInfo: MerchantTerminalDto, terminalid, userid): Promise<any> {
    if (isEmpty(terminalid) || isEmpty(userid)) throw new FillFieldsException();
    const data = await this.terminalCoreService.editTerminal(terminalid, userid, getInfo);
    if (!data) throw new UserCustomException('متاسفانه عملیات با خطا مواجه شده است', false, 500);
    return this.successNewMerchantopt(data);
  }

  async changeMerchantStatus(getInfo: UserMerchantDto, userid: string): Promise<any> {
    if (isEmpty(getInfo.status) || isEmpty(userid) || isEmpty(getInfo.merchantcode)) throw new FillFieldsException();
    const data = await this.merchantCoreService.changeMerchantStatus(getInfo.merchantcode, getInfo.status, userid);
    if (!data) throw new UserCustomException('متاسفانه عملیات با خطا مواجه شده است', false, 500);
    return this.successNewMerchantopt('');
  }

  async changeTerminalStatus(getInfo: MerchantTerminalDto, userid: string): Promise<any> {
    if (isEmpty(getInfo.terminalid) || isEmpty(getInfo.status) || isEmpty(userid)) throw new FillFieldsException();
    const data = await this.terminalCoreService.changeTerminalStatus(getInfo.terminalid, getInfo.status, userid);
    if (!data) throw new UserCustomException('متاسفانه عملیات با خطا مواجه شده است', false, 500);
    return this.successNewMerchantopt('');
  }

  async changeVisible(userid, terminalid, status): Promise<any> {
    if (isEmpty(terminalid) || isEmpty(userid)) throw new FillFieldsException();
    const data = await this.terminalCoreService.changeVisible(userid, terminalid, status);
    if (!data) throw new UserCustomException('متاسفانه عملیات با خطا مواجه شده است', false, 500);
    return this.successNewMerchantopt('');
  }

  async newTerminal(getInfo: MerchantTerminalDto): Promise<any> {
    // this.checkTerminalDto(getInfo);
    const merchantInfo = await this.merchantCoreService.findMerchantByID(getInfo.merchant);
    //const shebaFromAsanPardakht = await this.getIbanService(merchantInfo.merchantcode);
    //getInfo.sheba = shebaFromAsanPardakht.data;
    const user = await this.userService.findById(getInfo.user);
    if (!user) throw new UserCustomException('متاسفانه کاربر یافت نشد', false, 401);
    if (!isEmpty(getInfo.sheba)) {
      const bankname = shebaFinder(getInfo.sheba);
      const cosheba = await this.shebaService.findSheba(bankname.name);
      if (!cosheba) throw new UserCustomException('متاسفانه عملیات با خطا مواجه شده است');
      getInfo.cosheba = cosheba.shaba;
    }

    const terminalData = await this.counterService.getTerminalCounter(getInfo);
    const data = await this.terminalCoreService.addNewTerminal(terminalData);
    if (!data) throw new UserCustomException('متاسفانه عملیات با خطا مواجه شده است', false, 500);
    this.generalService.registerMerchantInAsanPardakht(merchantInfo.merchantcode, getInfo.terminalid);

    console.log("get terminal list data:::", data);
    return this.successNewTerminalOpt(data);
  }

  async getAllTerminals(userid, page): Promise<any> {
    const shares = await this.merchantShareService.getSharesByToId(userid);
    const array = [mongoose.Types.ObjectId(userid)];
    for (const share of shares) array.push(mongoose.Types.ObjectId(share.sharedMerchant as string));
    const data = await this.terminalCoreService.getMerchantsAllTerminal(array, page, true);
    return successOptWithPagination(data);
  }

  async searchAllTerminal(search, userid, page): Promise<any> {
    if (isEmpty(search)) throw new FillFieldsException();
    const data = await this.terminalCoreService.searchAllTerminals(search, userid, page);
    return successOptWithPagination(data);
  }

  async getListTerminals(userid, page, merchantid, role): Promise<any> {
    const data = await this.terminalCoreService.getListTerminals(userid, page, merchantid, role);
    const res = await this.genTerminalList(data.docs);
    data.docs = res;
    return this.transformPaginateData(data);
  }

  private async genTerminalList(data): Promise<any> {
    let tmpArray = Array();
    for (let i = 0; data.length > i; i++) {
      tmpArray.push({
        _id: data[i]._id,
        fullname: data[i].fullname,
        mobile: data[i].mobile,
        terminalid: data[i].terminalid,
        status: data[i].status,
        visible: data[i].visible,
        province: data[i].province,
        city: data[i].city,
        title: data[i].title,
        sheba: data[i].sheba,
        address: data[i].address,
        logo: imageTransform(data[i].logo),
      });
    }
    return tmpArray;
  }

  async getListMerchants(category, userid, page): Promise<any> {
    let cat;
    if (!isEmpty(category)) {
      const rdata = await this.category.findCat(category);
      if (!rdata) {
        cat = 0;
      } else {
        cat = rdata.name;
      }
    } else {
      cat = category;
    }
    const data = await this.merchantCoreService.getMerchantList(cat, userid, page);
    let tmpArray = Array();
    for (let i = 0; data.docs.length > i; i++) {
      tmpArray.push({
        _id: data.docs[i]._id,
        status: data.docs[i].status,
        psp: data.docs[i].psp,
        merchantcode: data.docs[i].merchantcode,
        title: data.docs[i].title,
        address: data.docs[i].address,
        province: data.docs[i].province,
        city: data.docs[i].city,
        category: data.docs[i].category,
        user: data.docs[i].user,
        autoSettle: data.docs[i].autoSettle,
        autoSettlePeriod: data.docs[i].autoSettlePeriod,
        autoSettleWage: data.docs[i].autoSettleWage,
        logo: imageTransform(data.docs[i].logo),
        img1: imageTransform(data.docs[i].img1),
        img2: imageTransform(data.docs[i].img2),
        img3: imageTransform(data.docs[i].img3),
        lat: data.docs[i].lat || 0,
        long: data.docs[i].long || 0,
        email: data.docs[i].email,
        tell: data.docs[i].tell,
        id: data.docs[i]._id,
      });
    }
    data.docs = tmpArray;
    return this.transformPaginateData(data);
  }

  async getSearchDataMerchant(userid, page, search, category): Promise<any> {
    let cat;
    if (!isEmpty(category)) {
      const rdata = await this.category.findCat(category);
      cat = rdata.name;
    } else {
      cat = category;
    }
    const data = await this.merchantCoreService.searchMerchants(userid, cat, search, page);
    return this.transformPaginateData(data);
  }

  async getSearchTerminal(userid, page, search, merchantid): Promise<any> {
    const data = await this.terminalCoreService.searchTerminals(userid, page, search, merchantid);
    return this.transformPaginateData(data);
  }

  async getIbanService(merchantcode): Promise<any> {
    const data = await getIbanFromAsanPardakht(merchantcode);
    if (data) {
      if (isNull(data.GetIBANSResult)) {
        throw new NotFoundException('پذیرنده مورد نظر یافت نشد');
      }
      return data.GetIBANSResult.string[0];
    } else {
      throw new NotFoundException();
    }
  }

  async editTerminal(userid, terminalid, getInfo: MerchantTerminalDto): Promise<any> {
    const terminalInfo = await this.terminalCoreService.findPspByTerminalId(terminalid);
    if (terminalInfo.merchant.psp.type != TerminalType.Mobile) {
      const bankname = shebaFinder(getInfo.sheba);
      const cosheba = await this.shebaService.findSheba(bankname.name);
      if (!cosheba) throw new UserCustomException('متاسفانه عملیات با خطا مواجه شده است');
      getInfo.cosheba = cosheba.shaba;
    }
    const data = await this.terminalCoreService.editTerminal(terminalid, userid, getInfo);
    if (!data) throw new UserCustomException('متاسفانه عملیات با خطا مواجه شده است', false, 500);
    return this.successNewMerchantopt('');
  }

  async setTerminalToClub(getInfo: SetTerminalToClubDto, userid: string): Promise<any> {
    const terminals = getInfo.terminal.split(',');
    if (terminals.length < 1) throw new FillFieldsException();

    if (isEmpty(getInfo.clubid)) throw new FillFieldsException();
    const clubInfo = await this.clubService.getInfoByClubid(getInfo.clubid);
    if (!clubInfo) throw new NotFoundException();
    for (let i = 0; i < terminals.length; i++) {
      this.terminalCoreService.setToCLub(terminals[i], clubInfo.owner).catch((err) => {
        throw new InternalServerErrorException();
      });
    }
    return successOpt();
  }

  async removeTerminalClub(terminalid: string, clubid: string, userid: string): Promise<any> {
    const clubInfo = await this.clubService.getInfoByClubidUserId(clubid, userid);
    if (!clubInfo) throw new NotFoundException();

    return this.terminalCoreService
      .removeFromClub(terminalid, clubInfo.owner)
      .then((res) => {
        if (res) return successOpt();
        return faildOpt();
      })
      .catch((err) => {
        throw new InternalServerErrorException();
      });
  }

  async getAllMerchantsByUserId(userId: string): Promise<any> {
    const shares = await this.merchantShareService.getSharesByToId(userId);
    const array = [mongoose.Types.ObjectId(userId)];
    for (const share of shares) array.push(mongoose.Types.ObjectId(share.shareFromUser as string));
    const data = await this.merchantCoreService.getAllMerchantsReport(array, true);
    console.log('merchantsss:::: ', data);
    return successOptWithDataNoValidation(data);
  }

  private async uploadPicture(req): Promise<any> {
    let returndata = {
      logo: null,
      img1: null,
      img2: null,
      img3: null,
    };
    if (req.files && req.files.logo) {
      const mime = this.checkMime(req.files.logo.mimetype);
      const logo = req.files.logo;
      const uuid = uniqid();
      const img = uuid + '.' + mime;
      await logo.mv(UPLOAD_URI + img, (err) => {
        if (err) throw new InternalServerErrorException();
      });
      returndata.logo = img;
    } else {
      delete returndata['logo'];
    }
    if (req.files && req.files.img1) {
      const mime = this.checkMime(req.files.img1.mimetype);
      const img1 = req.files.img1;
      const uuid = uniqid();
      const img = uuid + '.' + mime;
      await img1.mv(UPLOAD_URI + img, (err) => {
        if (err) throw new InternalServerErrorException();
      });
      returndata.img1 = img;
    } else {
      delete returndata['img1'];
    }
    if (req.files && req.files.img2) {
      const mime = this.checkMime(req.files.img2.mimetype);
      const img2 = req.files.img2;
      const uuid = uniqid();
      const img = uuid + '.' + mime;
      await img2.mv(UPLOAD_URI + img, (err) => {
        if (err) throw new InternalServerErrorException();
      });
      returndata.img2 = img;
    } else {
      delete returndata['img2'];
    }

    if (req.files && req.files.img3) {
      const mime = this.checkMime(req.files.img3.mimetype);
      const img3 = req.files.img2;
      const uuid = uniqid();
      const img = uuid + '.' + mime;
      await img3.mv(UPLOAD_URI + img, (err) => {
        if (err) throw new InternalServerErrorException();
      });
      returndata.img3 = img;
    } else {
      delete returndata['img3'];
    }

    return returndata;
  }

  async submitShare(data: any, terminalid): Promise<any> {
    data.forEach((value) => {
      this.shareService.new(terminalid, value.percent, value.sheba);
    });
  }

  async getShare(terminalid: string): Promise<any> {
    const data = await this.shareService.get(terminalid);
    return successOptWithDataNoValidation(data);
  }

  async removeShare(id: string): Promise<any> {
    const data = await this.shareService.remove(id);
    if (!data) throw new InternalServerErrorException();
    return successOpt();
  }

  async updateShare(getInfo, id: string): Promise<any> {
    console.log(getInfo);
    const data = await this.shareService.udpate(getInfo.sheba, getInfo.percent, id);
    if (!data) throw new InternalServerErrorException();
    return successOpt();
  }

  private checkMime(mimetype: string) {
    switch (mimetype) {
      case 'image/png': {
        return 'png';
      }
      case 'image/jpg': {
        return 'jpg';
      }
      case 'image/jpeg': {
        return 'jpeg';
      }
    }
  }

  private checkDto(getInfo: UserMerchantDto) {
    if (
      isEmpty(getInfo.user) ||
      isEmpty(getInfo.psp) ||
      isEmpty(getInfo.title) ||
      isEmpty(getInfo.city) ||
      isEmpty(getInfo.province) ||
      isEmpty(getInfo.address)
    )
      throw new FillFieldsException();
  }

  private checkTerminalDto(getInfo: MerchantTerminalDto) {
    if (
      isEmpty(getInfo.user) ||
      isEmpty(getInfo.address) ||
      isEmpty(getInfo.city) ||
      isEmpty(getInfo.merchant) ||
      isEmpty(getInfo.province) ||
      isEmpty(getInfo.psp) ||
      isEmpty(getInfo.status) ||
      isEmpty(getInfo.terminalid) ||
      isEmpty(getInfo.title)
    )
      throw new FillFieldsException();
  }

  private successNewMerchantopt(info) {
    return {
      status: 200,
      success: true,
      message: 'عملیات با موفقیت انجام شد',
      merchantid: info._id,
      user: info.user,
      psp: info.psp,
    };
  }

  private successNewTerminalOpt(info) {
    return {
      status: 200,
      success: true,
      message: 'عملیات با موفقیت انجام شد',
      terminalid: info._id,
    };
  }

  private transformPaginateData(data) {
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

  async getConnectedPosInfo(terminalId: string): Promise<any> {
    console.log({ terminalId });
    const result = await this.posCoreService.getInfoByTerminal(terminalId);
    console.log({ getPosInfo: result });
    let data = null;
    if (result) {
      data = {
        terminal: result.terminal,
        _id: result._id,
        mac: result.mac,
        modelname: result.modelname,
      };
    }
    return successOptWithDataNoValidation(result);
  }

  async connectPos(userId: string, terminalId: string, dto: AddPosDto): Promise<any> {
    if (!dto) throw new UserCustomException('تمامی فیلد‌ها را پر کنید');
    if (!dto.modelname) throw new UserCustomException('مدل دستگاه الزامیست');
    if (!dto.serial) throw new UserCustomException('شماره سریال دستگاه الزامیست');
    if (!dto.mac) throw new UserCustomException('شناسه دستگاه الزامیست');

    const currentAvailablePosInfo = await this.posCoreService.getInfo(dto.serial, dto.modelname, dto.mac);
    if (currentAvailablePosInfo) throw new UserCustomException('این دستگاه در حال حاضر فعال می‌باشد.');

    const normalizedDto: AddPosDto = {
      ...dto,
      terminal: terminalId,
    };
    const data = await this.posCoreService.create(normalizedDto);
    if (data) {
      const user = await this.userService.getInfoByUserid(userId);
      const terminal = await this.terminalCoreService.getInfoByID(terminalId);
      const message = `دستگاه ${dto.serial} توسط ${user.fullname} (${user.mobile}) به ترمینال ${terminal.title} (${terminal.terminalid}) متصل شد`;
      await this.posHistoryCoreService.create(dto, userId, terminalId, message);
    }
    return successOpt();
  }

  async disconnectPos(userid: string, terminalid: string, posId: string) {
    if (!terminalid || !posId) throw new UserCustomException('تمامی فیلد‌ها را پرکنید');

    const data = await this.posCoreService.disconnectFromTerminal(posId, terminalid);
    if (!data) throw new InternalServerErrorException('خطای سرور');

    const terminal = await this.terminalCoreService.getInfoByID(terminalid);
    const user = await this.userService.getInfoByUserid(userid);

    if (terminal) {
      const message = `دستگاه ${data.serial} توسط ${user.fullname} (${user.mobile}) از ترمینال ${terminal.title} (${terminal.terminalid}) تخلیه شد`;
      const dto = {
        mac: data.mac,
        serial: data.serial,
        modelname: data.modelname,
      };
      await this.posHistoryCoreService.create(dto, userid, terminal._id, message);
    }

    return successOpt();
  }
}
