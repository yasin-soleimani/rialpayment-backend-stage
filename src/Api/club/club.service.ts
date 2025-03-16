import {
  Injectable,
  successOptWithPagination,
  successOpt,
  faildOpt,
  successOptWithData,
  successOptWithDataNoValidation,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@vision/common';
import { ClubCoreService } from '../../Core/customerclub/club.service';
import { ClubDto } from './dto/club.dto';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { base64ImageUpload } from '@vision/common/utils/img-base64.util';
import { MerchantCoreTerminalService } from '../../Core/merchant/services/merchant-terminal.service';
import { addYearToExpire } from '@vision/common/utils/month-diff.util';
import * as uniqid from 'uniqid';
import { UPLOAD_URI } from '../../__dir__';

@Injectable()
export class CustomerClubService {
  constructor(
    private readonly clubService: ClubCoreService,
    private readonly terminalService: MerchantCoreTerminalService
  ) {}

  async getList(userid, page): Promise<any> {
    return this.clubService.getList(userid, page);
  }

  async getPrice(): Promise<any> {
    const data = await this.clubService.getPrice();
    if (data) {
      let reData = Array();
      reData.push({ price: data.giftcard, faname: 'هزینه امکان صدور کارت هدیه' });
      reData.push({ price: data.merchantreg || 0, faname: 'هزینه ثبت هر پذیرنده' });
      reData.push({ price: data.personalpage, faname: 'هزینه ثبت سایت اختصاصی' });
      reData.push({ price: data.userreg, faname: 'هزینه  ثبت هر کاربر ' });
      reData.push({ price: data.operator, faname: 'هزینه  ثبت اپراتور شعبه' });
      reData.push({ price: data.clubprice, faname: 'هزینه  ثبت باشگاه ۱ساله' });
      reData.push({ price: data.clubprice2, faname: 'هزینه  ثبت باشگاه ۲ساله' });
      reData.push({ price: data.customerwage, faname: 'هزینه فعال سازی درآمد ثبت مشتری' });
      reData.push({ price: data.merchantwage, faname: 'هزینه فعال سازی درآمد ثبت کارتخوان' });
      return successOptWithDataNoValidation(reData);
    } else {
      return faildOpt();
    }
  }

  async submitNewClub(getInfo: ClubDto): Promise<any> {
    if (!isEmpty(getInfo.clubcard)) {
      const upCard = await base64ImageUpload(getInfo.clubcard);
      if (upCard.res) {
        getInfo.clubcard = '';
      } else {
        getInfo.clubcard = upCard;
      }
    }
    return this.clubService.newClub(getInfo);
  }

  async getClubPrice(getInfo: ClubDto): Promise<any> {
    const data = await this.clubService.calcClub(getInfo);
    let reData = Array();
    reData.push({ price: data.clubprice, faname: 'هزینه  ثبت باشگاه' });
    reData.push({ price: data.giftcardprice, faname: 'اجازه صدور کارت هدیه' });
    reData.push({ price: data.merchantprice, faname: 'هزینه ثبت شعبه' });
    reData.push({ price: data.personalpageprice, faname: 'هزینه صفحه اختصاصی' });
    reData.push({ price: data.userregisterationprice, faname: 'هزینه  ثبت کاربر' });
    reData.push({ price: data.operator, faname: 'هزینه ثبت اپراتور' });
    reData.push({ price: data.customerwage, faname: 'هزینه فعال سازی درآمد ثبت مشتری' });
    reData.push({ price: data.merchantwage, faname: 'هزینه فعال سازی درآمد ثبت کارتخوان' });
    reData.push({ price: data.total, faname: 'جمع کل' });
    reData.push({ price: data.agent, faname: 'سهم نماینده' });
    reData.push({ price: data.company, faname: 'مبلغ قابل پرداخت' });

    return successOptWithDataNoValidation(reData);
  }

  async getClubLists(userid: string, page: number): Promise<any> {
    const data = await this.clubService.getClubList(userid, page);
    return successOptWithPagination(data);
  }

  async getClubDetails(userid, clubid): Promise<any> {
    const data = await this.clubService.getDetails(clubid, userid);
    if (!data) throw new NotFoundException();
    return successOptWithDataNoValidation(data[0]);
  }

  async test(): Promise<any> {
    return this.clubService.getUserClubs('5b79728ea44f9b6ad76e1d4e');
  }

  // async getClubInfo( userid ): Promise<any> {
  //   return this.clubService
  // }

  async getClubRemain(userid): Promise<any> {
    const data = await this.clubService.getClubRemain(userid);
    const rData = { user: data.userinfo.max };
    return successOptWithDataNoValidation(rData);
  }

  async getTerminalsList(clubid: string, page: number): Promise<any> {
    const info = await this.clubService.getInfoByClubid(clubid);
    const data = await this.terminalService.getMerchantsAllTerminal(info.owner, page);
    return successOptWithPagination(data);
  }

  async updateExpire(): Promise<any> {
    const data = await this.clubService.updateExpire();
    for (let i in data) {
      const end = addYearToExpire(data[i].priority);
      this.clubService.findAndUpdateExpire(data[i]._id, new Date(), end);
    }
    return data;
  }

  async uploadLogo(clubid: string, req: any): Promise<any> {
    if (req.files && req.files.logo) {
      const mime = this.checkMime(req.files.logo.mimetype);
      const imgx = req.files.logo;
      const uuid = uniqid();
      const img = 'ClubLogo-' + uuid + '.' + mime;
      await imgx.mv(UPLOAD_URI + img, (err) => {
        if (err) throw new InternalServerErrorException();
      });

      return this.clubService
        .uploadLogo(img, clubid)
        .then((res) => {
          if (!res) throw new InternalServerErrorException();
          return successOpt();
        })
        .catch((err) => {
          throw new InternalServerErrorException();
        });
    } else {
      throw new BadRequestException();
    }
  }

  checkMime(mimetype: string) {
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

      default: {
        throw new BadRequestException();
      }
    }
  }
}
