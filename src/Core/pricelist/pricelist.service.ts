import { Injectable } from '@vision/common';
import { PricelistCommonService } from './services/pricelist-common.service';

@Injectable()
export class PricelistCoreService {
  constructor(private readonly commonService: PricelistCommonService) {}
}
