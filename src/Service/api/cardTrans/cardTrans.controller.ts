import { Controller, Body, Req, Post } from '@vision/common';
import { CardTransServiceDto } from './dto/carstrans.dto';
import { CardTransService } from './cardTrans.Service';

@Controller('cardtrans')
export class CardTransController {
  constructor(private readonly cardTransService: CardTransService) {}

  @Post('info')
  async getCardInformation(@Body() getInfo: CardTransServiceDto, @Req() req): Promise<any> {
    return this.cardTransService.getInfo(getInfo);
  }

  @Post('transaction')
  async getTransaction(@Body() getInfo, @Req() req): Promise<any> {
    return this.cardTransService.getTransaction(getInfo.id);
  }
}
