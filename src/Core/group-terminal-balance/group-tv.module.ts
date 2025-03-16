import { Module } from '@vision/common';
import { GroupCoreModule } from '../group/group.module';
import { MerchantcoreModule } from '../merchant/merchantcore.module';
import { MerchantCoreTerminalBalanceService } from '../merchant/services/merchant-terminal-balance.service';
import { TurnOverCoreModule } from '../turnover/turnover.module';
import { AccountModule } from '../useraccount/account/account.module';
import { CardModule } from '../useraccount/card/card.module';
import { UserModule } from '../useraccount/user/user.module';
import { CoreGroupTerminalBalanceService } from './group-tb.service';
import { CoreGroupTerminalService } from './group-terminal.service';

@Module({
  imports: [MerchantcoreModule, AccountModule, CardModule, TurnOverCoreModule, UserModule, GroupCoreModule],
  providers: [CoreGroupTerminalBalanceService, CoreGroupTerminalService],
  exports: [CoreGroupTerminalBalanceService, CoreGroupTerminalService],
})
export class CoreGroupTerminalBalanceModule {}
