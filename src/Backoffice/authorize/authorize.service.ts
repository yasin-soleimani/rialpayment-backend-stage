import { Injectable, InternalServerErrorException, successOptWithPagination, successOpt } from '@vision/common';
import { AuthorizeUserzCoreService } from '../../Core/authorize/user/user.service';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { backofficeAuthorizeListModel } from './func/authorize-list.func';
import { BackofficeAuthorizeQueryBuilderList } from './func/authorize-query-builder.func';
import { AuthorizeUserWageDto } from './dto/authorize-wage.dto';
import { AuthorizeUserWageService } from '../../Core/authorize/user/services/user-wage.service';

@Injectable()
export class BackofficeAuthorizeService {
  constructor(
    private readonly authUserService: AuthorizeUserzCoreService,
    private readonly authorizeWageService: AuthorizeUserWageService
  ) {}

  async getList(getInfo, page: number): Promise<any> {
    const query = BackofficeAuthorizeQueryBuilderList(getInfo);
    return this.authUserService
      .getPaginateList(query, page)
      .then((res) => {
        if (!res) throw new InternalServerErrorException();
        res.docs = backofficeAuthorizeListModel(res.docs);
        return successOptWithPagination(res);
      })
      .catch((err) => {
        throw new InternalServerErrorException();
      });
  }

  async StatusChange(id: string, status: boolean, type: number): Promise<any> {
    if (isEmpty(type)) {
      return this.changeStatus(id, status);
    } else {
      return this.changeStatusType(id, type);
    }
  }

  async changeStatus(id: string, status: boolean): Promise<any> {
    if (isEmpty(id) || isEmpty(status)) throw new FillFieldsException();

    return this.authUserService
      .changeStatus(id, status)
      .then((res) => {
        if (!res) throw new InternalServerErrorException();
        return successOpt();
      })
      .catch((err) => {
        throw new InternalServerErrorException();
      });
  }
  async changeStatusType(id: string, type: number): Promise<any> {
    if (isEmpty(id) || isEmpty(type)) throw new FillFieldsException();

    return this.authUserService
      .changeStatusType(id, type)
      .then((res) => {
        if (!res) throw new InternalServerErrorException();

        return successOpt();
      })
      .catch((err) => {
        throw new InternalServerErrorException();
      });
  }

  async setWage(getInfo: AuthorizeUserWageDto): Promise<any> {}
}
