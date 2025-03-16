import { Injectable } from '@vision/common';
import { BasketProductCardService } from '../../../../Core/basket/cards/cards.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';

@Injectable()
export class BasketVitrinLisenceService {
  constructor(private readonly cardService: BasketProductCardService) {}

  async getReserve(productid: string, qty: number, shopid: string): Promise<any> {
    const cards = await this.cardService.getCardWithLimit(productid, qty);
    let counter = 0;
    for (const info of cards) {
      this.cardService.setReserve(info._id, shopid).then((res) => console.log(res, 're res'));
      counter++;
    }
    if (counter < qty) return false;
    return true;
  }

  async setSold(shopid): Promise<any> {
    const cards = await this.cardService.getShopIDCard(shopid);
    for (const info of cards) {
      this.cardService.setSold(info._id);
    }
  }
}
