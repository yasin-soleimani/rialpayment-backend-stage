import { Controller, Post } from '@vision/common';
import { Roles } from '../../Guard/roles.decorations';
import { Body } from '@vision/common/decorators/http/route-params.decorator';
import { BackofficeLoggerDto } from './dto/logger.dto';

@Controller('logger')
export class BackofficeLoggerController {
  constructor() {}

  @Post()
  @Roles('admin')
  async getFilterList(@Body() getInfo: BackofficeLoggerDto): Promise<any> {}
}
