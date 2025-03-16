import { Injectable } from '@vision/common';
import { BasketProductDto } from '../dto/product.dto';
import { BasketProductCommonService } from './product-common.service';

@Injectable()
export class BasketProductDownloadService {
  constructor(private readonly commonService: BasketProductCommonService) {}

  async addNew(getInfo: BasketProductDto): Promise<any> {
    return this.commonService.new(getInfo);
  }

  async edit(getInfo: BasketProductDto, id: string): Promise<any> {
    return this.commonService.update(getInfo, id);
  }
}
