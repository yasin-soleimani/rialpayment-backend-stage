import { Controller, Post } from '@vision/common';
import { Body } from '@vision/common/decorators/http/route-params.decorator';
import { ShaparakApiDto } from './dto/shaparak.dto';
import { ShaparakApiService } from './shaparak.service';

@Controller('shaparak')
export class ShaparakApiController {
  constructor(private shaparakService: ShaparakApiService) {}

  @Post('calc')
  async getCalc(@Body() getInfo: ShaparakApiDto): Promise<any> {
    console.log(getInfo);
    return this.shaparakService.getSettle(getInfo);
  }
}
