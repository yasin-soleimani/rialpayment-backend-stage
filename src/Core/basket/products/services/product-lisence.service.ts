import { BadRequestException, Injectable, InternalServerErrorException, successOpt } from '@vision/common';
import { BasketProductDto } from '../dto/product.dto';
import { BasketProductCommonService } from './product-common.service';
import { BasketProductCardFieldsService } from './product-card-fields.service';
import { BaksetProductTypes } from '../consts/products.const';
import { isArray } from 'util';

@Injectable()
export class BasketProductLisenceService {
  constructor(
    private readonly commonService: BasketProductCommonService,
    private readonly cardFieldService: BasketProductCardFieldsService
  ) {}

  async addNew(getInfo: BasketProductDto): Promise<any> {
    if (getInfo.type != BaksetProductTypes.Lisence) throw new BadRequestException();
    const Fields = JSON.parse(getInfo.fields);
    const data = await this.commonService.new(getInfo).then(async (res) => {
      if (!res) throw new InternalServerErrorException();

      await this.addCardField(Fields, res._id);
      return res;
    });

    if (!data) throw new InternalServerErrorException();

    return data;
  }

  async edit(getInfo: BasketProductDto, id: string): Promise<any> {
    if (getInfo.type != BaksetProductTypes.Lisence) throw new BadRequestException();
    const Fields = JSON.parse(getInfo.fields);

    const data = await this.commonService.update(getInfo, id).then(async (res) => {
      if (!res) throw new InternalServerErrorException();

      this.cardFieldService.removeProductCards(id).then(async (value) => {
        await this.addCardField(Fields, id);
      });

      return res;
    });

    if (!data) throw new InternalServerErrorException();

    return data;
  }

  private async addCardField(fields: string[], productid: string): Promise<any> {
    for (const info of fields) {
      await this.cardFieldService.addCardField(productid, info);
    }
  }
}
