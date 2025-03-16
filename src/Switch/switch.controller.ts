import { Controller, Post, Body } from '@vision/common';
import { NewSwitchService } from './switch.service';
import { NewSwitchDto } from './dto/new-switch.dto';

@Controller('ns')
export class NewSwitchController {
  constructor(private readonly switchService: NewSwitchService) {}

  @Post()
  async optSwitch(@Body() getInfo: NewSwitchDto): Promise<any> {
    return await this.switchService.opertaor(getInfo);
  }
}1
