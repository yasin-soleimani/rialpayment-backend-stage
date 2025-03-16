import { Injectable, InternalServerErrorException } from '@vision/common';
import { GetPspDto } from './dto/get-psp.dto';
import { isEmpty, isNil } from '@vision/common/utils/shared.utils';
import { DispatcherCoreService } from '../../Core/dispatcher/dispatcher.service';
import { SoapHamidService } from './services/soap-hamid.service';
import { SwitchService } from '../../Switch/next-generation/switch.service';
import { PspCoreService } from '../../Core/psp/psp/pspCore.service';

@Injectable()
export class PspService {
  constructor(
    private readonly dispatcherService: DispatcherCoreService,
    private readonly soapHamidService: SoapHamidService,
    private readonly switchService: SwitchService,
    private readonly pspService: PspCoreService
  ) {}

  async operator(getpspDto: GetPspDto) {
    if (isEmpty(getpspDto.TermID)) throw new InternalServerErrorException();
    const data = await this.checkpsp(getpspDto, getpspDto.Username, getpspDto.Password);
    if (data.status == false) {
      return data.msg;
    }
    if (!data) throw new InternalServerErrorException();
    // const userValidation = await this.dispatcherService.getMerchantInfo(getpspDto.TermID);
    // if ( userValidation.status == false ) return userValidation.msg;
    // if ( data || !isNil(data)  ) {
    //   if ( data.dispatcheruser.url == 'own' ) {
    return await this.switchService.action(getpspDto);
    //   } else {
    //     return await this.soapHamidService.operator(getpspDto);
    //   }
    // } else {
    //   return await this.soapHamidService.operator(getpspDto);
    // }
  }

  async checkpsp(getInfo, username: string, password: string): Promise<any> {
    const data = await this.pspService.checkValidate(username, password);
    if (data == false)
      return {
        status: false,
        msg: {
          CommandID: parseInt(getInfo.CommandID, 10) + 100,
          TraxID: getInfo.TraxID,
          TermID: getInfo.TermID,
          Merchant: getInfo.Merchant,
          ReceiveDT: getInfo.ReceiveDT,
          TermType: getInfo.termType || getInfo.TermType,
          TrackingCode: null,
          ReferenceNumber: null,
          Data: [],
          rsCode: 13,
        },
      };
    return { status: true };
  }

  async getPspInfoByIp(ip): Promise<any> {
    return this.pspService.getInfoByIp(ip);
  }
}
