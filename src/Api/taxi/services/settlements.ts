import { Injectable } from '@vision/common';
import { UserService } from '../../../Core/useraccount/user/user.service';
import { TaxiPayDto } from '../../../Core/taxi/dto/taxi-pay.dto';
import { Taxi } from '../../../Core/taxi/interfaces/taxi.interface';
import { TaxiEntityIdGenerator } from '../../../Core/taxi/functions/taxi-entity-it-generator.func';
import { GeneralService } from '../../../Core/service/general.service';
import { SepidApiService } from '../../../Core/taxi/services/sepid-api.service';
import { CounterCoreService } from '../../../Core/counter/counter.service';
import { TaxiCoreService } from '../../../Core/taxi/taxi.service';

@Injectable()
export class TaxiSettlementService {
  constructor(
    private readonly generalService: GeneralService,
    private readonly sepidApiService: SepidApiService,
    private readonly counterService: CounterCoreService,
    private readonly userService: UserService,
    private readonly taxiCoreService: TaxiCoreService
  ) {}
  async taxiSettlement(payInfo, sepidPan, user) {
    try {
      const actualData = await this.correctTaxiPayData(payInfo, user, payInfo, sepidPan);
      console.log('dataToBeSentTo microservice::::::: ', { ...actualData, amountAfterDiscount: actualData.amount });
      const updated = await this.taxiCoreService.update(payInfo.taxiInquiryId, {
        ...actualData,
        paid: true,
      });
      try {
        const sepidPayResult = await this.sepidApiService.pay(
          { ...actualData, transactionDate: updated.updatedAt, receiveDate: updated.createdAt },
          user._id
        );
        console.log('sepidPayResult::::::: ', sepidPayResult.data);
        const updateDto = {
          payInformation: sepidPayResult.data,
        };
        await this.taxiCoreService.update(payInfo.taxiInquiryId, updateDto);
        let lasUpdate;
        if (sepidPayResult.data.hasOwnProperty('success') && sepidPayResult.data.success === false) {
        } else lasUpdate = await this.taxiCoreService.update(payInfo.taxiInquiryId, { sepidPaid: true });
        console.log('Updated Taxi Inquiry Last :::::: ', lasUpdate);
      } catch (e) {
        if (e?.response?.data?.hasOwnProperty('result') && e?.response?.data?.result.hasOwnProperty('errors'))
          e.response.data.result.errors = JSON.stringify(e.response.data.result.errors);
        const updateDto = {
          payInformation: e.response?.data,
        };
        console.log('error update:::::: ', updateDto);
        await this.taxiCoreService.update(payInfo.taxiInquiryId, updateDto);
      }
    } catch (e) {
      console.log(e);
    }
  }
  private async correctTaxiPayData(
    payInfo: TaxiPayDto,
    user: any,
    taxiInquiryData: Taxi,
    pan: string
  ): Promise<TaxiPayDto> {
    const counter = await this.counterService.getTaxiNumber();
    const entityId = TaxiEntityIdGenerator(counter);
    return {
      taxiInquiryId: payInfo.taxiInquiryId,
      entityId: entityId,
      mobile: '0' + user.mobile,
      amount: payInfo.amount,
      amountAfterDiscount: payInfo.amount,
      terminalID: taxiInquiryData.terminalID,
      instituteId: taxiInquiryData.instituteId,
      customerId: '',
      nationalCode: user.nationalcode,
      Description: '',
      devicetype: payInfo.devicetype,
      pan,
    };
  }
}
