import { Injectable, successOptWithData, successOptWithDataNoValidation } from '@vision/common';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { MerchantTerminalPosInfoService } from '../../../Core/merchant/services/merchant-terminal-pos-info.service';
import { PspverifyCoreService } from '../../../Core/psp/pspverify/pspverifyCore.service';
import { PosPayReportDto } from '../dto/pay-report.dto';
import { PosPayRequestDto } from '../dto/pay-req.dto';
import { PosRegisterUserDto } from '../dto/pos-register-user.dto';
import { PosDataChecker, PosSuccess } from '../function/switch-response.function';
import * as jalalimoment from 'jalali-moment';

@Injectable()
export class PosReportService {
  constructor(
    private readonly pspVerifyService: PspverifyCoreService,
    private readonly termninalService: MerchantTerminalPosInfoService
  ) {}

  async getLastTransaction(getInfo: PosPayRequestDto): Promise<any> {
    const posInfo = await this.termninalService.getInfoByMac(getInfo.mac);
    if (!posInfo) throw new UserCustomException('پذیرنده نامعتبر', false, 500);

    if (posInfo.terminal.status == false || posInfo.terminal.merchant.status == false)
      throw new UserCustomException('پذیرنده نامعتبر');

    const data = await this.pspVerifyService.getLastTransaction(posInfo.terminal._id, posInfo.terminal.merchant._id);
    if (!data) throw new UserCustomException('تراکنش یافت نشد', false, 404);

    const result = JSON.parse(data.reqout);
    result.ReceiveDT = data.createdAt;

    result.Data = PosDataChecker(result.Data);
    return PosSuccess(result, 'پرداخت موفق');
  }

  async getReport(getInfo: PosPayReportDto): Promise<any> {
    const posInfo = await this.termninalService.getInfoByMac(getInfo.mac);
    if (!posInfo) throw new UserCustomException('پذیرنده نامعتبر', false, 500);

    if (posInfo.terminal.status == false || posInfo.terminal.merchant.status == false)
      throw new UserCustomException('پذیرنده نامعتبر');

    const data = await this.pspVerifyService.getReport(
      posInfo.terminal._id,
      posInfo.terminal.merchant._id,
      new Date(Number(getInfo.start)),
      new Date(Number(getInfo.end))
    );
    console.log('post report data: ', data);
    return successOptWithDataNoValidation(this.reportFunc(data));
  }

  private reportFunc(data) {
    const tmpArray = Array();

    for (const item of data) {
      const tmp = JSON.parse(item.reqout);
      tmpArray.push({
        date: item.createdAt,
        datex: jalalimoment(item.createdAt).locale('fa').format('jYYYY/jMM/jDD HH:mm'),
        amount: tmp.TrnAmt,
      });
    }

    return tmpArray;
  }
}
