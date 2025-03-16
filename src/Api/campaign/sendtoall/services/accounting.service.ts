import { Injectable, InternalServerErrorException } from "@vision/common";
import { notEnoughMoneyException } from "@vision/common/exceptions/notEnoughMoney.exception";
import { AccountService } from "../../../../Core/useraccount/account/account.service";

@Injectable()
export class SendToAllAccounttingApiService {

  private UnitPrice = 700;

  constructor(
    private readonly accountService: AccountService
  ) { }

  async checkBalance(userId: string, message: string, mobiles: number): Promise<any> {

    const messagesCount = Math.ceil(message.length / 70);
    const total = Math.ceil(mobiles * messagesCount);
    const amount = Math.ceil(total * this.UnitPrice);
    if (total > 1) {
      const wallet = await this.accountService.getBalance(userId, 'wallet');
      if (wallet.balance < amount) throw new notEnoughMoneyException();

      this.accountService.dechargeAccount(userId, 'wallet', amount).then(res => {
        if (!res) throw new InternalServerErrorException();

        const title = 'هزینه ارسال پیامک  به تعداد ' + total;
        this.accountService.accountSetLogg(title, 'SmsAds', amount, true, userId, null);
      })
    }

    return true;
  }
}