import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  successOpt,
  successOptWithPagination,
} from '@vision/common';
import { UserService } from '../../../Core/useraccount/user/user.service';
import { OrganizationPoolCoreService } from '../../../Core/organization/pool/pool.service';
import { BackofficePoolAddNewDto, BackofficePoolFilterDto } from '../dto/pool.dto';
import { BackofficePoolFilterQueryBuilder } from '../function/query-builder.func';

@Injectable()
export class BackofficePoolCommonService {
  constructor(
    private readonly orgPoolService: OrganizationPoolCoreService,
    private readonly userService: UserService
  ) {}

  // Pool
  async getListPool(getInfo: BackofficePoolFilterDto, userid: string, page: number): Promise<any> {
    const query = await this.getListPoolCondition(getInfo);
    const data = await this.orgPoolService.getListPool(query, page);

    return successOptWithPagination(data);
  }

  private async getListPoolCondition(getInfo: BackofficePoolFilterDto): Promise<any> {
    if (!getInfo.search && !getInfo.user) {
      return {};
    }
    if (getInfo.search && getInfo.search.length > 0) {
      const data = await this.userService.getdata(getInfo.search, getInfo.search);
      if (!data) throw new NotFoundException('یافت نشد');
      return { user: data._id };
    } else {
      return BackofficePoolFilterQueryBuilder(getInfo);
    }
  }

  async addNewPool(getInfo: BackofficePoolAddNewDto, userid: string): Promise<any> {
    const data = await this.orgPoolService.addPool(getInfo.groups, getInfo.title, getInfo.user, getInfo.minremain);
    if (!data) throw new InternalServerErrorException();

    const title = 'ساخت استخر پول ' + data.title + 'توسط مدیریت';

    await this.orgPoolService.addHistory(data.id, userid, title);

    return successOpt();
  }

  async editPool(getInfo: BackofficePoolAddNewDto, userid: string): Promise<any> {
    const info = await this.orgPoolService.getPoolInfo(getInfo.id);
    if (!info) throw new NotFoundException('استخر پول یافت نشد');

    const data = await this.orgPoolService.editPool(getInfo.id, getInfo.title, getInfo.minremain);
    if (!data) throw new InternalServerErrorException();

    const title = 'تغییر عنوان استخر پول از ' + info.title + ' به ' + getInfo.title;
    await this.orgPoolService.addHistory(getInfo.id, userid, title);

    return successOpt();
  }

  async changeStatus(getInfo: BackofficePoolAddNewDto, userid: string): Promise<any> {
    const info = await this.orgPoolService.getPoolInfo(getInfo.id);
    if (!info) throw new NotFoundException('استخر پول یافت نشد');

    const data = await this.orgPoolService.changeStatusPool(getInfo.id, getInfo.status);
    if (!data) throw new InternalServerErrorException();

    const title = 'تغییر وضعیت استخر پول از ' + info.status + ' به ' + getInfo.status;
    await this.orgPoolService.addHistory(getInfo.id, userid, title);

    return successOpt();
  }

  // History
  async getHistoryList(pool: string, page: number): Promise<any> {
    const query = { pool };
    const data = await this.orgPoolService.getListHistory(query, page);

    return successOptWithPagination(data);
  }

  // Turnover
  async getTurnoverList(poolid: string, page: number): Promise<any> {
    const query = { pool: poolid };
    const data = await this.orgPoolService.getListTurnOver(query, page);

    return successOptWithPagination(data);
  }
}
