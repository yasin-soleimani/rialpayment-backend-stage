import { Injectable, InternalServerErrorException, successOptWithDataNoValidation } from '@vision/common';
import { MainInsuranceHistoryCoreService } from '../../../Core/main-insurance/services/history.service';
import { MainInsuranceHistoryDto } from '../../../Core/main-insurance/dto/history.dto';
import { InsurancePaymentApiService } from './payment.service';
import { MainInsuranceProductCoreService } from '../../../Core/main-insurance/services/products.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { IpgCoreService } from '../../../Core/ipg/ipgcore.service';

@Injectable()
export class InsuranceHistoryApiService {
  constructor(
    private readonly historyService: MainInsuranceHistoryCoreService,
    private readonly productService: MainInsuranceProductCoreService,
    private readonly paymentService: InsurancePaymentApiService,
    private readonly ipgService: IpgCoreService
  ) {}

  async addNew(getInfo: MainInsuranceHistoryDto): Promise<any> {
    const productInfo = await this.productService.getInfoById(getInfo.product);
    if (!productInfo) throw new UserCustomException('یافت نشد', false, 404);

    const data = await this.historyService.addNew(getInfo);
    if (!data) throw new InternalServerErrorException();

    return this.paymentService.play(getInfo.type, getInfo.mobile, productInfo.amount, productInfo, data);
    // if (!payment || payment.status != true) throw new InternalServerErrorException();

    // const sina = new InsuranceSinaThirdParty();

    // const body = sina.getInternalTravelModel( getInfo, data, productInfo );
    // const datax = await sina.getInternalTravel(body );

    // if ( datax.Output != 1 ) throw new UserCustomException('متاسفانه عملیات با خطا مواجه شده است');

    // this.historyService.updateStatus( data._id, true, datax.link, datax.Bno );
    // return successOptWithDataNoValidation( datax.link );
    // console.log( datax, 'datax' );
    // if ( datax.Output == 1 && !isEmpty(datax.link)) {
    //   const payment = await this.paymentService.play( getInfo.type, getInfo.mobile, productInfo.amount, productInfo );
    //   if ( !payment || payment.status != true ) throw new InternalServerErrorException();
    //   console.log( payment);
    //   return payment;
    // } else {

    // }
  }

  async getInfoById(ref: string, id: string): Promise<any> {
    const info = await this.historyService.getInfoById(id);
  }

  async getTransactionInfo(id: string, ref: string): Promise<any> {
    const traxInfo = await this.ipgService.getAll(id);
    console.log(traxInfo, 'traxInfo');
    if (!traxInfo || traxInfo._id != id) throw new UserCustomException('تراکنش نامعتبر');

    const insuranceInfo = await this.historyService.getInfoById(ref);
    console.log(insuranceInfo, 'insuranceInfo');

    if (!insuranceInfo || insuranceInfo._id != ref) throw new UserCustomException('تراکنش نامعتبر');

    if (traxInfo.payload != insuranceInfo._id) throw new UserCustomException('تراکنش نامعتبر');

    if (insuranceInfo.link && insuranceInfo.link.length > 2) {
      return successOptWithDataNoValidation({
        amount: traxInfo.amount,
        createdAt: traxInfo.createdAt,
        status: true,
        link: insuranceInfo.link,
      });
    } else {
      return successOptWithDataNoValidation({
        amount: traxInfo.amount,
        createdAt: traxInfo.createdAt,
        status: false,
        link: '',
      });
    }
  }
}
