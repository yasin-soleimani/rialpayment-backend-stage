import { Injectable, InternalServerErrorException, successOpt, successOptWithDataNoValidation } from '@vision/common';
import { AuthorizeUserWageService } from '../../../Core/authorize/user/services/user-wage.service';
import { AuthorizeUserWageDto } from '../dto/authorize-wage.dto';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { UserService } from '../../../Core/useraccount/user/user.service';
import { authorizeWageModel } from '../func/authorize-wage.func';

@Injectable()
export class BackofficeAuthorizeUserWageService {
  constructor(private readonly wageService: AuthorizeUserWageService, private readonly userService: UserService) {}

  async addNew(getInfo: AuthorizeUserWageDto): Promise<any> {
    if (getInfo.loginstatus == true) {
      if (Number(getInfo.loginwage) < 1) throw new FillFieldsException();
    }

    if (getInfo.paystatus == true) {
      if (Number(getInfo.paywage) < 1) throw new FillFieldsException();
    }

    return this.wageService
      .addNew(
        getInfo.id,
        getInfo.loginstatus,
        getInfo.loginwage,
        getInfo.loginwagefrom,
        getInfo.paystatus,
        getInfo.paytype,
        getInfo.paywage,
        getInfo.paywagefrom
      )
      .then((res) => {
        if (!res) throw new InternalServerErrorException();

        return successOpt();
      })
      .catch((err) => {
        throw new InternalServerErrorException();
      });
  }

  async getWageInfo(userid: string): Promise<any> {
    return this.wageService
      .getLast(userid)
      .then((res) => {
        return successOptWithDataNoValidation(authorizeWageModel(res));
      })
      .catch((err) => {
        throw new InternalServerErrorException();
      });
  }
}
