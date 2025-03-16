import { Controller, Post, Body, Req } from '@vision/common';
import { GeneralService } from '../../../Core/service/general.service';
import { BackofficeUsersAccountBlockService } from '../services/users-account-block.service';
import { BackofficeUsersBlockAmountDto } from '../dto/users-block-amount.dto';

@Controller('users/block')
export class BackofficeUsersAccountController {
  constructor(
    private readonly generalService: GeneralService,
    private readonly usersAccountBlock: BackofficeUsersAccountBlockService
  ) {}

  @Post('filter')
  async getFilter(@Body() getInfo, @Req() req): Promise<any> {
    const page = await this.generalService.getPage(req);
    return this.usersAccountBlock.getList(getInfo, page);
  }

  @Post()
  async blockAmount(@Body() getInfo: BackofficeUsersBlockAmountDto): Promise<any> {
    return this.usersAccountBlock.blockAmount(getInfo);
  }
}
