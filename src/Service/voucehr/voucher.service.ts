import { Injectable, InternalServerErrorException, NotFoundException, successOpt } from '@vision/common';
import { VoucherServiceDto } from './dto/voucher.dto';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { SafevoucherCoreService } from '../../Core/safevoucher/safevoucher.service';
import { AccountService } from '../../Core/useraccount/account/account.service';
import { UserService } from '../../Core/useraccount/user/user.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { VoucherWageApiService } from '../../Api/voucher/service/voucher-wage.service';
import { voucherReturnSuccess } from './component/voucher.component';
import { IpgCoreService } from '../../Core/ipg/ipgcore.service';
import { MipgCoreService } from '../../Core/mipg/mipg.service';
import { imageTransform } from '@vision/common/transform/image.transform';
import { isArray } from 'util';

@Injectable()
export class SafeVoucherWebService {
  constructor(
    private readonly voucherService: SafevoucherCoreService,
    private readonly accountService: AccountService,
    private readonly wageService: VoucherWageApiService,
    private readonly ipgService: IpgCoreService,
    private readonly mipgService: MipgCoreService,
    private readonly userService: UserService
  ) {}

  async use(getInfo: VoucherServiceDto): Promise<any> {
    // this.checkInfo( getInfo );
    // const userInfo = await this.userService.getInfoByAccountNo( getInfo.account ) ;
    // if ( !userInfo ) throw new UserCustomException('ووچر یافت نشد', false, -1);
    // const VoucherInfo = await this.voucherService.find( getInfo.voucherid );
    // if ( !VoucherInfo ) throw new UserCustomException('ووچر یافت نشد', false, -2);
    // if ( VoucherInfo.to ) throw new UserCustomException('ووچر معتبر نمی باشد', false, -5);
    // if ( VoucherInfo.pin != getInfo.pin ) throw new UserCustomException('رمز اشتباه می باشد', false, -3);
    // if ( VoucherInfo.key != getInfo.key ) throw new UserCustomException('رمز تصدیق اشتباه می باشد', false, -4);
    // const wage = await this.wageService.getVoucherWage( userInfo._id, Number(VoucherInfo.amount) );
    // const total = Number(VoucherInfo.amount) - wage;
    // await this.voucherService.use(  userInfo._id, getInfo.voucherid, total );
    // return this.accountService.chargeAccount( userInfo._id, 'wallet', Number(total) ).then(  res => {
    //   // const title = 'شارژ کیف پول با شماره ووچر ' + VoucherInfo.id;
    //   // this.accountService.accountSetLogg( title, 'SafeVoucher', Number(total), true, null, userInfo._id );
    //   // if ( wage > 0) {
    //   //   const titlex = 'کارمزد ووچر';
    //   //   this.accountService.accountSetLogg(titlex, 'SafeVoucherWage', Number(wage), true, userInfo._id, null );
    //   // }
    //   await this.ipgService.addAuthInfo( )
    //   return voucherReturnSuccess( Number(total) );
    // })
  }

  private checkInfo(getInfo: VoucherServiceDto) {
    if (isEmpty(getInfo.account)) throw new FillFieldsException('شماره حساب پر کنید');
    if (isEmpty(getInfo.key)) throw new FillFieldsException('رمز تصدیق پر کنید');
    if (isEmpty(getInfo.pin)) throw new FillFieldsException('رمز ار پر کنید');
    if (isEmpty(getInfo.voucherid)) throw new FillFieldsException(' ووچر را پر کنید');
  }

  async getToken(getInfo): Promise<any> {
    return this.ipgService.newReqSubmit(getInfo);
  }

  async getTokenInfo(token): Promise<any> {
    console.log(token);
    const data = await this.ipgService.findByUserInvoiceAndUpdate(token);
    if (!data) throw new NotFoundException();
    const terminalInfo = await this.mipgService.getInfo(data.terminalid);
    if (!terminalInfo) throw new NotFoundException();

    return {
      status: 200,
      terminalid: terminalInfo.terminalid,
      title: terminalInfo.title,
      amount: data.amount,
      site: terminalInfo.url || '',
      logo: imageTransform(terminalInfo.logo),
    };
  }

  async getPayment(getInfo): Promise<any> {
    const ipgInfo = await this.ipgService.getTraxInfoByInvoiceid(getInfo.token);
    if (!ipgInfo) throw new UserCustomException('تراکنش یافت نشد', false, -7);

    const terminalInfo = await this.mipgService.getInfo(ipgInfo.terminalid);
    if (!terminalInfo) throw new UserCustomException('ترمینال یافت نشد', false, -1);

    const VoucherInfo = await this.voucherService.find(getInfo.voucherid);
    console.log(getInfo);
    console.log(VoucherInfo);
    if (!VoucherInfo) throw new UserCustomException('ووچر یافت نشد', false, -2);

    if (!isEmpty(VoucherInfo.to)) throw new UserCustomException('ووچر معتبر نمی باشد', false, -5);
    if (VoucherInfo.mod && VoucherInfo.mod < ipgInfo.amount) throw new UserCustomException('عدم موجودی', false, -6);
    if (VoucherInfo.pin != getInfo.pin) throw new UserCustomException('رمز اشتباه می باشد', false, -3);
    if (VoucherInfo.key != getInfo.key) throw new UserCustomException('رمز تصدیق اشتباه می باشد', false, -4);

    const data = await this.voucherService.useIpg(terminalInfo.user._id, getInfo.voucherid, ipgInfo.amount);
    if (!data) throw new InternalServerErrorException();

    const wage = await this.ipgService.typeSelector(ipgInfo.paytype, ipgInfo.amount, ipgInfo.karmozd);
    await this.ipgService.addAuthInfo(getInfo.token, {
      total: wage.total,
      amount: wage.amount,
      discount: wage.discount,
      wagetype: 2,
      isdirect: false,
      details: {
        cardnumber: VoucherInfo.id,
        rrn: new Date().getTime(),
        respmsg: 'عملیات با موفقیت انجام شد',
        respcode: 0,
      },
    });

    return successOpt();
  }

  async cancelPayment(token: string): Promise<any> {
    const ipgInfo = await this.ipgService.getTraxInfoByInvoiceid(token);
    if (!ipgInfo) throw new UserCustomException('تراکنش یافت نشد', false, -7);

    const terminalInfo = await this.mipgService.getInfo(ipgInfo.terminalid);
    if (!terminalInfo) throw new UserCustomException('ترمینال یافت نشد', false, -1);

    await this.ipgService
      .addUserInvoiceDetails(token, {
        respmsg: 'تراکنش توسط کاربر لغو شد',
        respcode: -10,
      })
      .then((res) => {
        console.log(res, 'resssssssssssssssssssssssssssssssssssss');
      });

    return successOpt();
  }

  async getTraxInfo(token: string): Promise<any> {
    return this.ipgService.getTraxInfoByInvoiceid(token);
  }
}
