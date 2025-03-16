import { Injectable } from '@vision/common';
import { MerchantCoreTerminalBalanceService } from '../../merchant/services/merchant-terminal-balance.service';
import { OrganizationNewChargeGetRemain } from '../../organization/new-charge/function/get-last.func';
import { TurnoverCommonCoreService } from './common.service';

@Injectable()
export class TurnoverBalanceCoreService {
  constructor(
    private readonly commonService: TurnoverCommonCoreService,
    private readonly balanceInStoreService: MerchantCoreTerminalBalanceService
  ) {}

  async getListUser(query, page: number): Promise<any> {
    return this.commonService.getListUser(query, page);
  }

  async getListTerminals(userId: string, page: number): Promise<any> {
    return this.commonService.getListUsersTerminal(userId, page);
  }
  
  async chargeCard(type: string, terminals, cardId: string, amount: number, ref: string, desc): Promise<any> {
    if (Array.isArray(terminals)) {
      for (const terminal of terminals) {
        const last = await this.getBalancByCardId(cardId, terminal);

        let remain = amount;
        if (last) {
          remain = last.remain + Number(amount);
        }

        this.commonService.submitNew(type, terminal, undefined, cardId, amount, 0, remain, desc, ref);
      }
    } else {
      const last = await this.getBalancByCardId(cardId, terminals);

      let remain = amount;
      if (last) {
        remain = last.remain + Number(amount);
      }

      this.commonService.submitNew(type, terminals, undefined, cardId, amount, 0, remain, desc, ref);
    }

    return true;
  }

  async ChargeUser(type: string, terminals, userId: string, amount: number, ref: string, desc): Promise<any> {
    if (Array.isArray(terminals)) {
      for (const terminal of terminals) {
        console.log(terminal, 'terminallllllllllllllllllllllllllllllllll');
        const last = await this.getBalanceByUserId(userId, terminal);

        let remain = amount;
        if (last) {
          remain = last.remain + Number(amount);
        }

        this.commonService.submitNew(type, terminal, userId, undefined, amount, 0, remain, desc, ref);
      }
    } else {
      const last = await this.getBalanceByUserId(userId, terminals);

      let remain = amount;
      if (last) {
        remain = last.remain + Number(amount);
      }

      this.commonService.submitNew(type, terminals, userId, undefined, amount, 0, remain, desc, ref);
    }

    return true;
  }

  async deChargeUserLecredit(
    type: string,
    userId: string,
    amount: number,
    ref: string,
    desc,
    leasing: string,
    leasingApply: string
  ): Promise<any> {
    const last = await this.getBalanceByUserIdAndLeasing(userId, leasing);

    let remain = amount;
    if (last) {
      remain = last.remain - Number(amount);
    }

    this.commonService.submitNewLeCredit(
      type,
      null,
      userId,
      undefined,
      0,
      amount,
      remain,
      desc,
      ref,
      leasing,
      leasingApply
    );

    return true;
  }
  async ChargeUserLecredit(
    type: string,
    userId: string,
    amount: number,
    ref: string,
    desc,
    leasing: string,
    leasingApply: string
  ): Promise<any> {
    const last = await this.getBalanceByUserIdAndLeasing(userId, leasing);

    let remain = amount;
    if (last) {
      remain = last.remain + Number(amount);
    }

    this.commonService.submitNewLeCredit(
      type,
      null,
      userId,
      undefined,
      amount,
      0,
      remain,
      desc,
      ref,
      leasing,
      leasingApply
    );

    return true;
  }

  async dechargeCard(type: string, cardId: string, amount: number, ref: string, desc): Promise<any> {
    const terminals = await this.balanceInStoreService.getTerminalsByCardId(cardId);
    if (terminals.length > 0) {
      for (const terminal of terminals[0].terminals) {
        const balance = await this.getBalancByCardId(cardId, terminal);
        const BIS = await this.balanceInStoreService.getBalanceInStoreWithCard(terminal, cardId);

        if (!balance) {
          this.commonService.submitNew(
            type,
            terminal,
            undefined,
            cardId,
            0,
            BIS[0].amount,
            BIS[0].amount,
            'انتقال مانده به لیست جدید',
            ref
          );
        } else if (balance.remain != BIS[0].amount) {
          this.commonService.submitNew(type, terminal, undefined, cardId, 0, amount, BIS[0].amount, desc, ref);
        }
      }
    } else {
      return false;
    }

    return true;
  }

  async dechargeUser(type: string, userId: string, amount: number, ref: string, desc): Promise<any> {
    const terminals = await this.balanceInStoreService.getTerminalsByUserId(userId);

    if (terminals.length > 0) {
      for (const terminal of terminals[0].terminals) {
        const balance = await this.getBalanceByUserId(userId, terminal);
        const BIS = await this.balanceInStoreService.getBalanceInStore(terminal, userId);
        if (!balance) {
          this.commonService.submitNew(
            type,
            terminal,
            userId,
            undefined,
            0,
            BIS[0].amount,
            BIS[0].amount,
            'انتقال مانده به لیست جدید',
            ref
          );
        } else if (balance.remain != BIS[0].amount) {
          this.commonService.submitNew(type, terminal, userId, undefined, 0, amount, BIS[0].amount, desc, ref);
        }
      }
    } else {
      return false;
    }

    return true;
  }

  async getBalancByCardId(cardId: string, terminalId: string): Promise<any> {
    return this.commonService.getLastByQuery({
      card: cardId,
      terminal: terminalId,
    });
  }

  async getBalanceByUserId(userId: string, terminalId: string): Promise<any> {
    return this.commonService.getLastByQuery({
      user: userId,
      terminal: terminalId,
    });
  }

  async getBalanceByUserIdAndLeasing(userId: string, leasing: string) {
    return this.commonService.getLastByQuery({
      user: userId,
      leasing: leasing,
    });
  }
}
