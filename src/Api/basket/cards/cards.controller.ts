import { Controller, Delete, Get, Post, Put, Req } from '@vision/common';
import { GeneralService } from '../../../Core/service/general.service';
import { BasketCardsApiServce } from './cards.service';
import { Body } from '@vision/common/decorators/http/route-params.decorator';
import { BasketCardsApiDto } from './dto/cards.dto';

@Controller('basket/cards')
export class BasketCardsApiController {
  constructor(private readonly generalService: GeneralService, private readonly cardsService: BasketCardsApiServce) {}

  @Get()
  async getList(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const id = await this.generalService.getID(req);
    const page = await this.generalService.getPage(req);

    return this.cardsService.getList(id, userid, page);
  }

  @Put()
  async udpate(@Body() getInfo: BasketCardsApiDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);

    return this.cardsService.update(getInfo, userid);
  }

  @Post()
  async new(@Body() getInfo: BasketCardsApiDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.cardsService.addNew(getInfo, userid);
  }

  @Delete()
  async remove(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const cardID = await this.generalService.getID(req);

    return this.cardsService.remove(cardID, userid);
  }
}
