import { Injectable } from '@vision/common';
import { ShaparakApiDto } from './dto/shaparak.dto';
import { ShaparakSettlementService } from '../../Core/shaparak/settlement/settlement.service';

@Injectable()
export class ShaparakApiService {
  constructor(private readonly settlementService: ShaparakSettlementService) {}

  async getSettle(getInfo: ShaparakApiDto): Promise<any> {
    return this.settlementService.getSettlement(getInfo.start, getInfo.end);
  }
}
