import { Injectable, InternalServerErrorException } from '@vision/common';
import { AccountService } from './../../../../Core/useraccount/account/account.service';
import { IpgCoreService } from '../../ipgcore.service';

@Injectable()
export class IpgCoreWagetypeService {
  constructor(private readonly accountService: AccountService, private readonly ipgService: IpgCoreService) {}
}
