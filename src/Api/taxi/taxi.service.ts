import { Request } from 'express-serve-static-core';
import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  successOptWithDataNoValidation,
  successOptWithPagination,
} from '@vision/common';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { GeneralService } from '../../Core/service/general.service';
import {
  checkTaxiBarcode as isGetTaxiInformationDtoValid,
  generateSepidPan,
  normalizeGetTaxiInformationData,
} from './utils/taxi.utils';
import { GetTaxiInformationDto } from '../../Core/taxi/dto/taxi-get-information.dto';
import { TaxiPayDto } from '../../Core/taxi/dto/taxi-pay.dto';
import { isEmpty, isNil } from '@vision/common/utils/shared.utils';
import { SepidApiService } from '../../Core/taxi/services/sepid-api.service';
import { CounterCoreService } from '../../Core/counter/counter.service';
import { UserService } from '../../Core/useraccount/user/user.service';
import { TaxiCoreService } from '../../Core/taxi/taxi.service';
import { CardService } from '../../Core/useraccount/card/card.service';
import { TaxiInAppPurchaseApiService } from './services/taxi-purchase.service';
import { TaxiSettlementService } from './services/settlements';
import { ClubPwaService } from '../../Core/clubpwa/club-pwa.service';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';

@Injectable()
export class TaxiService {
  constructor(
    private readonly generalService: GeneralService,
    private readonly sepidApiService: SepidApiService,
    private readonly counterService: CounterCoreService,
    private readonly userService: UserService,
    private readonly taxiCoreService: TaxiCoreService,
    private readonly cardService: CardService,
    private readonly purchaseService: TaxiInAppPurchaseApiService,
    private readonly taxiSettlement: TaxiSettlementService,
    private readonly clubPwaService: ClubPwaService
  ) {}

  async getTaxiInformation(dto: GetTaxiInformationDto, req: Request): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    const referrer = req.headers.referer;
    if (!userId) throw new UserCustomException('شما به این قسمت دسترسی ندارید.');

    if (!isGetTaxiInformationDtoValid(dto)) throw new UserCustomException('بارکد اسکن شده معتبر نیست');
    try {
      const normalizedData = normalizeGetTaxiInformationData(dto, userId, null, referrer);
      const result = await this.sepidApiService.getTaxiInfo(normalizedData, userId);
      const normalizedDataPlusTaxiInformation = normalizeGetTaxiInformationData(dto, userId, result.data, referrer);

      const taxiData = await this.taxiCoreService.create(normalizedDataPlusTaxiInformation);
      if (!taxiData) throw new UserCustomException('ارتباط با سرور برقرار نشد');

      // return _id of the created document to client because
      // we need to be able to distinguish correct document while processing to do payment

      const returnData = {
        taxiInquiryId: taxiData._id,
        taxiInformation: result.data,
      };
      return successOptWithDataNoValidation(returnData);
    } catch (e) {
      console.log(e);
      throw new UserCustomException('ارتباط با سرور برقرار نشد');
    }
  }

  async pay(payInfo: TaxiPayDto, req: Request): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    if (!userId) throw new ForbiddenException('شما به این قسمت دسترسی ندارید.');
    const user = await this.userService.getInfoByUserid(userId);
    payInfo.user = userId;
    const userCardData = await this.cardService.getCardByUserID(userId);
    if (!userCardData) throw new UserCustomException('شماره کارتی برای کاربر یافت نشد');
    const stringifiedUserCardNumber: string = userCardData.cardno.toString();
    const partCode = stringifiedUserCardNumber.slice(6, 15);
    const sepidPan = generateSepidPan(partCode);
    if (!sepidPan) throw new UserCustomException('خطا در دریافت شماره کارت');

    const isPayDtoValid = await this.checkPayDto(payInfo);
    if (!isPayDtoValid) throw new UserCustomException('اطلاعات ارسالی معتبر نیستند.');

    const taxiInquiryData = await this.taxiCoreService.getTaxiInquiryById(payInfo.taxiInquiryId);
    if (!taxiInquiryData) throw new NotFoundException('اطلاعات جهت پرداخت یافت نشد');
    payInfo.terminalID = taxiInquiryData.terminalID;
    payInfo.instituteId = taxiInquiryData.instituteId;
    const setPayment = await this.purchaseService.action(payInfo, sepidPan, user);

    //TODO: inAppPurchase!
    return setPayment;
  }
  async getPaymentInformation(req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    const data = await this.taxiCoreService.getTaxiPaymentData(userId, isNaN(parseInt(page)) ? 1 : parseInt(page));
    return successOptWithPagination(data);
  }

  async getPaymentInformationById(req, id): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    const data = await this.taxiCoreService.getUserTaxiInquiryById(id);
    if (data.length > 1) {
      return successOptWithDataNoValidation(data[0]);
    } else {
      return successOptWithDataNoValidation(null);
    }
  }

  async inAppCallback(getInfo, res): Promise<any> {
    console.log(getInfo, 'getInfo');
    if (getInfo.data && getInfo.data.length < 1) throw new InternalServerErrorException();

    const { parsed } = JSON.parse(getInfo.data);
    if (!parsed) throw new InternalServerErrorException();
    console.log('parsed payload:::::: ', parsed);

    const user = await this.userService.getInfoByUserid(parsed?.payload?.payInfo.user);
    const taxiInquiryData = await this.taxiCoreService.getTaxiInquiryById(parsed?.payload?.payInfo.taxiInquiryId);
    if (!taxiInquiryData) throw new NotFoundException('اطلاعات جهت پرداخت یافت نشد');

    const url = await this.selectCorrectCallbackBaseUrl(parsed?.payload?.payInfo.devicetype, taxiInquiryData.referrer);

    if (getInfo?.rscode == 20) {
      await this.taxiSettlement.taxiSettlement(parsed?.payload?.payInfo, parsed?.payload?.sepidPan, user);

      const queryString = 'refid=' + getInfo.traxid + '&status=true&amount=' + parsed?.payload?.payInfo.amount;
      res.writeHead(301, {
        Location: url + queryString,
      });
      res.end();
    } else {
      const queryString = 'refid=' + getInfo.traxid + '&status=false&amount=' + parsed?.payload?.payInfo.amount;
      res.writeHead(301, {
        Location: url + queryString,
      });
      res.end();
    }
  }

  private async selectCorrectCallbackBaseUrl(deviceType: string, referer: string): Promise<string> {
    const clubPwaData = await this.clubPwaService.getClubPwaByReferer(referer);
    if (clubPwaData) {
      return clubPwaData.taxiCallback;
    } else {
      switch (deviceType) {
        case 'pwa':
          return process.env.TAXI_PWA_PAYMENT_CALLBACK + '?';
        case 'mobile':
          return 'app://ir.mersad.rialpayment/product?';
        case 'mobile_google':
          return 'app://com.mersad.rialpayment/product?';
      }
    }
  }

  private async checkPayDto(payInfo: TaxiPayDto): Promise<boolean> {
    if (isNil(payInfo)) return false;
    if (isNil(payInfo.amount) || Number.isNaN(payInfo.amount) || payInfo.amount < 10000) return false;
    if (isNil(payInfo.taxiInquiryId) || typeof payInfo.taxiInquiryId !== 'string') return false;
    return true;
  }
}
