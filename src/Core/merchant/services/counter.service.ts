import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@vision/common';
import { CounterCoreService } from '../../../Core/counter/counter.service';
import { PspCoreService } from '../../psp/psp/pspCore.service';
import { CardcounterService } from '../../useraccount/cardcounter/cardcounter.service';
import { MerchantcoreDto } from '../dto/merchantcore.dto';
import { MerchantTerminalCoreDto } from '../dto/merchanterminalcore.dto';

@Injectable()
export class MerchantCounterCoreService {
  constructor(
    @Inject('MerchantTerminalModel') private readonly merchantTerminalModel: any,
    @Inject('MerchantModel') private readonly merchantModel: any,
    private readonly pspService: PspCoreService,
    private readonly counterService: CounterCoreService
  ) {}

  async getMerchantCounter(merchantInfo: MerchantcoreDto): Promise<any> {
    const pspInfo = await this.pspService.getPsp(merchantInfo.psp);
    if (!pspInfo) throw new InternalServerErrorException('پی اس پی یافت نشد');

    if (!pspInfo.inc) return merchantInfo;

    const merchant = await this.getMerchantId();
    merchantInfo.merchantcode = merchant;
    return merchantInfo;
  }

  async getTerminalCounter(getInfo: MerchantTerminalCoreDto): Promise<any> {
    const merchantInfo = await this.merchantModel.findOne({ _id: getInfo.merchant });
    if (!merchantInfo) throw new NotFoundException('پذیرندده یافت نشد');

    const pspInfo = await this.pspService.getPsp(merchantInfo.psp);
    if (!pspInfo) throw new InternalServerErrorException('پی اس پی یافت نشد');

    if (!pspInfo.inc) return getInfo;

    const terminal = await this.getTerminalId();
    getInfo.terminalid = terminal;
    return getInfo;
  }

  private async getMerchantId(): Promise<any> {
    let merchantCode: Number = 0;
    merchantCode = await this.counterService.getMerchantId();
    let exist = await this.merchantModel.findOne({ merchantCode: merchantCode });
    if (!exist) {return merchantCode;} else{
      merchantCode = await this.counterService.getMerchantId();
      exist = await this.merchantModel.findOne({ merchantCode: merchantCode });
      if ( exist ) throw new InternalServerErrorException();
    }

    // while( !exist ) {
    //   merchantCode = await this.counterService.getMerchant();
    //   exist = await this.merchantModel.findOne({ merchantCode: merchantCode });
    // }
  }

  private async getTerminalId(): Promise<any> {
    let terminalId: Number = 0;
    terminalId = await this.counterService.getTerminalId();
    let exist = await this.merchantTerminalModel.findOne({ terminalid: terminalId });
    if (!exist){
      return terminalId;
    }else {
      terminalId = await this.counterService.getTerminalId();
      exist = await this.merchantTerminalModel.findOne({ terminalid: terminalId });
      if ( exist ) throw new InternalServerErrorException();
    }


  }
}
