import { Injectable, InternalServerErrorException } from '@vision/common';
import { IpgCoreService } from '../../../../Core/ipg/ipgcore.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { UserService } from '../../../../Core/useraccount/user/user.service';
import { BasketShopCoreService } from '../../../../Core/basket/shop/service/shop.service';
import { BasketVitrinLisenceService } from './lisence.service';
import { BasketProductService } from '../../../../Core/basket/products/services/product.service';
import { BasketStoreCoreService } from '../../../../Core/basket/store/basket-store.service';
import { VitrinWageService } from './wage.service';
import { AccountService } from '../../../../Core/useraccount/account/account.service';
import { LoggercoreService } from '../../../../Core/logger/loggercore.service';
import { VitrinPaymentSettlementApiService } from '../payment/settlement.service';
import { ClubPwaService } from '../../../../Core/clubpwa/club-pwa.service';

@Injectable()
export class BasketVitrinCallback {
  constructor(
    private readonly ipgService: IpgCoreService,
    private readonly productService: BasketProductService,
    private readonly storeService: BasketStoreCoreService,
    private readonly basketShopService: BasketShopCoreService,
    private readonly basketLisenceService: BasketVitrinLisenceService,
    private readonly wageService: VitrinWageService,
    private readonly accountService: AccountService,
    private readonly userService: UserService,
    private readonly loggerService: LoggercoreService,
    private readonly settlementService: VitrinPaymentSettlementApiService,
    private readonly clubPwaService: ClubPwaService
  ) {}

  async trasnfer(getInfo, req, res): Promise<any> {
    const info = await this.ipgService.addDetailsSaman(getInfo);
    if (!info) throw new UserCustomException('تراکنش یافت نشد');
    const userInfo = await this.userService.getInfoByUserid(info.info.user);
    if (!userInfo) throw new UserCustomException('کاربر یافت نشد ', false, 404);

    const storeInfo = await this.storeService.getInfo(userInfo._id);
    if (!storeInfo) throw new UserCustomException('فروشگاه یافت نشد ', false, 404);

    const money = await this.wageService.typeSelector(
      Number(storeInfo.transfer.type),
      Number(info.info.amount),
      Number(storeInfo.transfer.karmozd)
    );

    await this.accountService.dechargeAccount(info.info.user, 'wallet', money.discount).then((res) => {
      this.accountService.accountSetLoggWithRef(
        'کسر کارمزد انتقال وجه',
        info.info.invoiceid,
        money.discount,
        true,
        info.info.user,
        null
      );
      this.ipgService
        .addQuery(info._id, {
          discount: money.discount,
          total: money.total,
          amount: money.amount,
        })
        .then((result) => console.log(result));
    });

    if (info.status == 'ok') {
      const url = 'refid=' + info.info.ref + '&status=true&amount=' + info.info.amount;
      res.writeHead(301, {
        Location: process.env.STORE_URL_ADDRESS + storeInfo.nickname + '/transfer/payment-type?' + url,
      });
      res.end();
    } else {
      const url = 'refid=' + info.info.ref + '&status=false&amount=' + info.info.amount;
      res.writeHead(301, {
        Location: process.env.STORE_URL_ADDRESS + storeInfo.nickname + '/transfer/payment-type?' + url,
      });
      res.end();
    }
  }

  async payment(getInfo, req, res): Promise<any> {
    const payInfo = await this.ipgService.getTraxInfo(getInfo.terminalid, getInfo.ref);
    if (!payInfo) throw new UserCustomException('تراکنش یافت نشد');

    const userInfo = await this.userService.getInfoByUserid(payInfo.user);
    if (!userInfo) throw new UserCustomException('کاربر یافت نشد ', false, 404);

    const storeInfo = await this.storeService.getInfo(userInfo._id);
    if (!storeInfo) throw new UserCustomException('فروشگاه یافت نشد ', false, 404);

    const shopInfo = await this.basketShopService.getShopList(getInfo.ref);

    if (getInfo.respcode == 0) {
      const verify = await this.ipgService.verify(getInfo.terminalid, payInfo.userinvoice);
      if (!verify) throw new InternalServerErrorException();

      if (verify.status == 0 && verify.success == true) {
        this.settlementService.actionIPG(shopInfo, payInfo, storeInfo);

        const url = 'refid=' + payInfo.userinvoice + '&status=true&amount=' + payInfo.total;
        const baseUrl = await this.selectCorrectCallbackBaseUrl(
          shopInfo.devicetype,
          storeInfo.nickname,
          shopInfo.referer
        );
        console.log('vitrin callback::::: ', url, baseUrl);
        res.writeHead(301, { Location: baseUrl + url });
        res.end();
      } else {
        const url = 'refid=' + payInfo.userinvoice + '&status=false&amount=' + payInfo.total;
        const baseUrl = await this.selectCorrectCallbackBaseUrl(
          shopInfo.devicetype,
          storeInfo.nickname,
          shopInfo.referer
        );
        console.log('vitrin callback::::: ', url, baseUrl);
        res.writeHead(301, { Location: baseUrl + url });
        res.end();
      }
    } else {
      const url = 'refid=' + payInfo.userinvoice + '&status=false&amount=' + payInfo.total;
      const baseUrl = await this.selectCorrectCallbackBaseUrl(
        shopInfo.devicetype,
        storeInfo.nickname,
        shopInfo.referer
      );
      console.log('vitrin callback::::: ', url, baseUrl);
      res.writeHead(301, { Location: baseUrl + url });
      res.end();
    }
  }

  async transferCallback(getInfo, response): Promise<any> {
    console.log('in transfer main callback data::::::::::::::::::::::: ', getInfo);
    const payInfo = await this.ipgService.getTraxInfo(getInfo.terminalid, getInfo.ref);
    if (!payInfo) throw new UserCustomException('تراکنش یافت نشد');
    let parsed;

    if (payInfo.payload && payInfo.payload.length > 1) {
      parsed = JSON.parse(payInfo.payload);
    } else {
      throw new UserCustomException('تراکنش با خطا مواجه شده است', false, 500);
    }
    console.log('after payload::::::::::::::::::::::: ');

    const userInfo = await this.userService.getInfoByUserid(parsed.user);
    if (!userInfo) throw new UserCustomException('کاربر یافت نشد ', false, 404);
    // const storeInfo = await this.storeService.getInfo(userInfo._id);
    // if (!storeInfo) throw new UserCustomException('فروشگاه یافت نشد ', false, 404);
    let amount = payInfo.amount;
    const nullInfo = {
      billid: parsed,
      paymentid: 0,
      amount: amount,
      type: 0,
    };
    if (getInfo.respcode == 0) {
      const verify = await this.ipgService.verify(getInfo.terminalid, payInfo.userinvoice);
      if (!verify) throw new InternalServerErrorException();
      console.log('after verify::::::::::::::::::::::: ');
      if (verify.status == 0 && verify.success == true) {
        console.log('after verify status::::::::::::::::::::::: ');
        if (payInfo.retry < 2) {
          console.log('after retry::::::::::::::::::::::: ');
          const title =
            'انتقال وجه توسط ' + parsed.fullname + ' به شماره موبایل ' + parsed.mobile + ' - ' + parsed.description;
          await this.accountService.chargeAccount(parsed.user, 'wallet', amount);
          this.accountService.accountSetLoggWithRef(title, payInfo.userinvoice, payInfo.total, true, null, parsed.user);
          await this.loggerService.updateLogWithQueryAndRef(payInfo.userinvoice, {
            $set: { title: title },
          });
        }

        const url = 'refid=' + payInfo.userinvoice + '&status=true&amount=' + amount;
        response.writeHead(301, {
          Location: process.env.LINK_APP_URL_ADDRESS + '/transfer/' + userInfo.account_no + '/payment-type?' + url,
        });
        response.end();
      } else {
        const url = 'refid=' + payInfo.userinvoice + '&status=false&amount=' + amount;
        response.writeHead(301, {
          Location: process.env.LINK_APP_URL_ADDRESS + '/transfer/' + userInfo.account_no + '/payment-type?' + url,
        });
        response.end();
      }
    } else {
      const url = 'refid=' + payInfo.userinvoice + '&status=false&amount=' + amount;
      response.writeHead(301, {
        Location: process.env.LINK_APP_URL_ADDRESS + '/transfer/' + userInfo.account_no + '/payment-type?' + url,
      });
      response.end();
    }
  }

  async inAppCallback(getInfo, res): Promise<any> {
    console.log(getInfo, 'getInfo');
    const shopInfo = await this.basketShopService.getShopListById(getInfo.ref);
    if (!shopInfo) throw new InternalServerErrorException();

    if (shopInfo.paid == true) throw new InternalServerErrorException();

    if (getInfo.data && getInfo.data.length < 1) throw new InternalServerErrorException();

    const { parsed } = JSON.parse(getInfo.data);
    if (!parsed) throw new InternalServerErrorException();

    const storeInfo = await this.storeService.getInfo(parsed?.payload?.storeUser);

    const url = await this.selectCorrectCallbackBaseUrl(
      parsed?.payload?.devicetype,
      parsed?.payload?.nickname,
      shopInfo.referer
    );

    if (getInfo?.rscode == 20) {
      await this.settlementService.actionInAppPurchase(shopInfo, getInfo.traxid, storeInfo);
      const queryString = 'refid=' + getInfo.traxid + '&status=true&amount=' + shopInfo.total;
      res.writeHead(301, {
        Location: url + queryString,
      });
      res.end();
    } else {
      const queryString = 'refid=' + getInfo.traxid + '&status=false&amount=' + shopInfo.total;
      res.writeHead(301, {
        Location: url + queryString,
      });
      res.end();
    }
  }

  private async selectCorrectCallbackBaseUrl(
    deviceType: string,
    shopNickname: string,
    referer: string
  ): Promise<string> {
    const clubPwaData = await this.clubPwaService.getClubPwaByReferer(referer);
    if (clubPwaData) {
      return clubPwaData.inAppPurchaseCallback;
    } else {
      switch (deviceType) {
        case 'pwa':
          return 'https://pwa.rialpayment.ir/i/shops/basket-checkout-result?';
        case 'mobile':
          return 'app://ir.mersad.rialpayment/product?';
        case 'mobile_google':
          return 'app://com.mersad.rialpayment/product?';
        case 'web':
          return process.env.STORE_URL_ADDRESS + shopNickname + '/final?';
        default:
          return process.env.STORE_URL_ADDRESS + shopNickname + '/final?';
      }
    }
  }
}
