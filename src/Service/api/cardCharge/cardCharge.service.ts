import { Injectable } from '@vision/common';
import { CardService } from '../../../Core/useraccount/card/card.service';
import { UserService } from '../../../Core/useraccount/user/user.service';
import { AccountService } from '../../../Core/useraccount/account/account.service';

@Injectable()
export class CardChargeService {
  constructor(
    private readonly cardService: CardService,
    private readonly userService: UserService,
    private readonly accountService: AccountService
  ) {}

  async getCardInfo(): Promise<any> {}
}
