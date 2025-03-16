import { Controller, Post, Req } from '@vision/common';
import { Body } from '@vision/common/decorators/http/route-params.decorator';
import { NewmipgRequestDto } from './dto/newmipg-request.dto';
import { NewMipgService } from './newmipg.service';

@Controller('invoice')
export class NewMipgServiceController {
  constructor(private readonly newmipgService: NewMipgService) {}

  @Post('request')
  async requestTrans(@Body() getInfo: NewmipgRequestDto, @Req() req: Request): Promise<any> {
    return this.newmipgService.requestTransaction(getInfo, req);
  }

  @Post('pay')
  async redirectTrans(): Promise<any> {}

  @Post('cehck')
  async checkTrans(): Promise<any> {}
}
