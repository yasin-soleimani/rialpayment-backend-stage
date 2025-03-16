import { Injectable, successOptWithPagination, InternalServerErrorException, successOpt } from '@vision/common';
import { AccountBlockService } from '../../../Core/useraccount/account/services/account-block.service';
import { BackofficeUSersAccountBlockFilterDto } from '../dto/users-block-filter.dto';
import { BackofficeUsersAccountBlockQueryBuilder } from '../component/users-account-block-query-builder.dto';
import { BackofficeUsersAccountBlockReturnModel } from '../component/users-account-return-model.component';
import { BackofficeUsersBlockAmountDto } from '../dto/users-block-amount.dto';
import { UserService } from '../../../Core/useraccount/user/user.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { isEmpty } from '@vision/common/utils/shared.utils';

@Injectable()
export class BackofficeUsersAccountBlockService {
  constructor(private readonly accoutnBlockService: AccountBlockService, private readonly userService: UserService) {}

  async getList(getInfo: BackofficeUSersAccountBlockFilterDto, page: number): Promise<any> {
    const query = BackofficeUsersAccountBlockQueryBuilder(getInfo);
    const data = await this.accoutnBlockService.getFilter(query, page);
    data.docs = BackofficeUsersAccountBlockReturnModel(data.docs);
    return successOptWithPagination(data);
  }

  async blockAmount(getInfo: BackofficeUsersBlockAmountDto): Promise<any> {
    const userInfo = await this.userService.getInfoByUserid(getInfo.user);
    if (!userInfo) throw new UserCustomException('کاربر یافت نشد ', false, 500);

    if (Number(getInfo.amount) < 1) throw new UserCustomException('مبلغ درخواستی معتبر نمی باشد', false, 500);

    if (isEmpty(getInfo.description)) throw new UserCustomException('توضیحات پر شود', false, 500);
    if (isEmpty(getInfo.type)) getInfo.type = 'wallet';
    return this.accoutnBlockService
      .add(getInfo.user, getInfo.description, Number(getInfo.amount), getInfo.type)
      .then((res) => {
        if (!res) throw new InternalServerErrorException();

        return successOpt();
      })
      .catch((err) => {
        throw new InternalServerErrorException();
      });
  }
}
