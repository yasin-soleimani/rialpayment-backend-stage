import { Injectable, InternalServerErrorException } from '@vision/common';
import { IpgCoreService } from '../../../Core/ipg/ipgcore.service';
import { InternetPaymentGatewayService } from '../../../Service/internet-payment-gateway/ipg.service';
import { InsuranceSinaThirdParty } from '../../../ThirdParty/insurance/sina/sina-insurance.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { MainInsuranceHistoryCoreService } from '../../../Core/main-insurance/services/history.service';

@Injectable()
export class InsuranceVerifyApiService {
  constructor(
    private readonly ipgService: IpgCoreService,
    private readonly iccIpgService: InternetPaymentGatewayService,
    private readonly historyService: MainInsuranceHistoryCoreService
  ) {}

  async getVerify(token, res): Promise<any> {
    const tokenInfo = await this.ipgService.findByUserInvoice(token);
    if (tokenInfo.userinvoice != token) throw new InternalServerErrorException();
    const iInfo = await this.historyService.getInfoById(tokenInfo.payload);
    if (!iInfo || iInfo._id != tokenInfo.payload) throw new InternalServerErrorException();

    if (tokenInfo.details.respcode == 0) {
      const data = await this.iccIpgService.verifyPayment(token, { ip: '::1' });
      if (data.status == 0) {
        const sina = new InsuranceSinaThirdParty();
        const body = sina.getInternalTravelModel(iInfo, data, iInfo.product);
        const datax = await sina.getInternalTravel(body);
        await this.historyService.updateStatus(iInfo._id, true, datax.link, datax.Bno);

        console.log(datax, datax);
        if (datax.Output != 1) {
          res.redirect(
            301,
            'http://192.168.0.190:4200/transactionStatus?status=nok&id=' + tokenInfo._id + '&&ref=' + tokenInfo.payload
          );
        }
        res.redirect(
          301,
          'http://192.168.0.190:4200/transactionStatus?status=ok&id=' + tokenInfo._id + '&&ref=' + tokenInfo.payload
        );
      } else {
        res.redirect(
          301,
          'http://192.168.0.190:4200/transactionStatus?=status=nok&id=' + tokenInfo._id + '&&ref=' + tokenInfo.payload
        );
      }
    } else {
      res.redirect(
        301,
        'http://192.168.0.190:4200/transactionStatus?status=nok&id=' + tokenInfo._id + '&&ref=' + tokenInfo.payload
      );
    }
  }
}
