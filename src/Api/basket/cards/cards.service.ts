import { Injectable, InternalServerErrorException, successOpt, successOptWithPagination } from '@vision/common';
import { BasketProductCardService } from '../../../Core/basket/cards/cards.service';
import { BasketCardsApiDto } from './dto/cards.dto';

@Injectable()
export class BasketCardsApiServce {
  constructor(private readonly cardsService: BasketProductCardService) {}

  async getList(productid: string, userid: string, page: number): Promise<any> {
    const data = await this.cardsService.getList(productid, userid, page);
    if (!data) throw new InternalServerErrorException();

    return successOptWithPagination(data);
  }

  async addNew(getInfo: BasketCardsApiDto, userid: string): Promise<any> {
    const data = await this.cardsService.addNew(getInfo, userid);
    if (!data) throw new InternalServerErrorException();

    return successOpt();
  }

  async remove(cardid: string, userid: string): Promise<any> {
    const data = await this.cardsService.remove(cardid, userid);
    if (!data) throw new InternalServerErrorException();

    return successOpt();
  }

  async update(getInfo: BasketCardsApiDto, userid: string): Promise<any> {
    const data = await this.cardsService.edit(getInfo, userid);
    if (!data) throw new InternalServerErrorException();

    return successOpt();
  }
}
