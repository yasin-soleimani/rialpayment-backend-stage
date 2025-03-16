import { Controller, Delete, Post, Req } from '@vision/common';
import { BackofficeCardDto } from './dto/card.dto';
import { BackofficeCardService } from './card.service';
import { Body } from '@vision/common/decorators/http/route-params.decorator';
import { GeneralService } from '../../Core/service/general.service';

@Controller('card')
export class BackofficeCardController {
  constructor(private readonly cardService: BackofficeCardService, private readonly generalService: GeneralService) {}

  @Post('change')
  async changeCard(@Body() getInfo: BackofficeCardDto): Promise<any> {
    return this.cardService.changeCard(getInfo);
  }

  @Post('pin')
  async changePassword(@Body() getInfo: BackofficeCardDto): Promise<any> {
    return this.cardService.changePassword(getInfo);
  }

  @Post('status')
  async changeStatus(@Body() getInfo: BackofficeCardDto): Promise<any> {
    return this.cardService.changeStatus(getInfo);
  }

  @Post('secpin')
  async changeSecpin(@Body() getInfo: BackofficeCardDto): Promise<any> {
    return this.cardService.changeSecpin(getInfo);
  }

  @Delete()
  async deleteShetabCard(@Req() req): Promise<any> {
    const card = await this.generalService.getID(req);
    return this.cardService.removeShetabCard(card);
  }
}
