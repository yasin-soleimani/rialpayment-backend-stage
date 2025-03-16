import { Injectable, InternalServerErrorException } from '@vision/common';
import { UserService } from '../../user/user.service';
import { AccountService } from '../../account/account.service';
import { CardService } from '../../card/card.service';

@Injectable()
export class RegisterOperatorInService {
  constructor(
    private readonly userService: UserService,
    private readonly accountService: AccountService,
    private readonly cardService: CardService
  ) {}

  async regOpt(mobile, password, fullname, ref, nationalcode, type): Promise<any> {
    const optInfo = await this.userService.regOperator(mobile, password, fullname, ref, nationalcode, type);
    if (!optInfo) throw new InternalServerErrorException();

    this.accountService.makeAccountID(optInfo._id);
    this.accountService.makeWallet(optInfo._id);
    this.accountService.makeCredit(optInfo._id);
    this.accountService.makeDiscount(optInfo._id);
    this.accountService.makeIdm(optInfo._id);
    this.cardService.generateCard(optInfo._id);
    this.userService.makeRefID(optInfo._id);

    return optInfo;
  }
}
