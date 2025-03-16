import { Injectable, successOptWithPagination } from '@vision/common';
import { LoginHistoryService } from '../../Core/useraccount/history/login-history.service';
import { BackofficeHistoryDto } from './dto/history.dto';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { timestamoToISO } from '@vision/common/utils/month-diff.util';

@Injectable()
export class BackofficeHistoryService {
  constructor(private readonly loginHistoryService: LoginHistoryService) {}

  async getList(userid, page): Promise<any> {
    const data = await this.loginHistoryService.getListPaginate(userid, page);
    return successOptWithPagination(data);
  }

  async getFilterList(getInfo: BackofficeHistoryDto, userid, page): Promise<any> {
    if (isEmpty(userid)) throw new FillFieldsException();
    let query;
    if (!isEmpty(getInfo.start) && !isEmpty(getInfo.end)) {
      if (getInfo.start > getInfo.end) throw new UserCustomException('رنج تاریخ صحیح نمی باشد');

      const start = timestamoToISO(Number(getInfo.start) * 1000);
      const end = timestamoToISO(Number(getInfo.end) * 1000);

      query = {
        createdAt: {
          $gte: start,
          $lte: end,
        },
        user: userid,
      };
    } else {
      query = {
        user: userid,
      };
    }

    const data = await this.loginHistoryService.getListWithFilterPaginate(query, page);
    console.log(data);
    return successOptWithPagination(data);
  }
}
