import { Controller, Post, Body, successOpt } from '@vision/common';
import { DisableCheckoutByMobileDto } from './dto/disablebymobile.dto';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { UserService } from '../../Core/useraccount/user/user.service';
import { UserNotfoundException } from '@vision/common/exceptions/user-notfound.exception';
import { BackofficeCheckoutAccountService } from './services/account.service';

@Controller('checkoutsettings')
export class CheckoutSettingsController {
  constructor(
    private readonly userService: UserService,
    private readonly checkoutAccountService: BackofficeCheckoutAccountService
  ) {}

  @Post('disableuser')
  async disableCheckoutUser(@Body() getInfo: DisableCheckoutByMobileDto): Promise<any> {
    if (isEmpty(getInfo.mobile)) throw new FillFieldsException();

    const data = await this.userService.changeCheckoutSatus(getInfo.mobile, false);
    if (!data) throw new UserNotfoundException();
    return successOpt();
  }
}
