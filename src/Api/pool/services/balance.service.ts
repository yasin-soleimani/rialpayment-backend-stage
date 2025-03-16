import { Injectable, InternalServerErrorException, NotFoundException, successOpt } from '@vision/common';
import { notEnoughMoneyException } from '@vision/common/exceptions/notEnoughMoney.exception';
import { OrganizationPoolCoreService } from '../../../Core/organization/pool/pool.service';
import { AccountService } from '../../../Core/useraccount/account/account.service';
import { PoolApiDto } from '../dto/pool.dto';

@Injectable()
export class PoolApiBalanceService {
  constructor(
    private readonly accountService: AccountService,
    private readonly orgPoolService: OrganizationPoolCoreService
  ) {}

  async charge(userid: string, getInfo: PoolApiDto): Promise<any> {
    const poolInfo = await this.orgPoolService.getPoolInfo(getInfo.pool);
    if (!poolInfo) throw new NotFoundException('یافت نشد');

    const wallet = await this.accountService.getBalance(userid, 'wallet');
    if (!wallet) throw new InternalServerErrorException();

    if (wallet.balance < Number(getInfo.amount)) throw new notEnoughMoneyException();

    const deCharge = await this.accountService.dechargeAccount(userid, 'wallet', Number(getInfo.amount));
    if (!deCharge) throw new InternalServerErrorException();

    const title = ' شارژ استخر پول ' + poolInfo.title;
    const ref = 'ChargePool-' + new Date().getTime() + '4';
    const log = await this.accountService.accountSetLoggWithRef(title, ref, getInfo.amount, true, userid, null);

    const data = await this.orgPoolService.charge(getInfo.pool, getInfo.amount, userid, title, null, ref);

    if (!data) {
      await this.accountService.chargeAccount(userid, 'wallet', Number(getInfo.amount));
      const title = 'بازگشت وجه شارژ استخر پول ' + poolInfo.title;
      const ref = 'ChargePool-' + new Date().getTime() + '2';
      const log = await this.accountService.accountSetLoggWithRef(title, ref, getInfo.amount, true, userid, null);
    }

    const titlex = 'شارژ استخر توسط کیف پول';
    await this.orgPoolService.addHistory(getInfo.pool, userid, titlex);

    return successOpt();
  }
}
