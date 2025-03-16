import { Module } from '@vision/common';
import { CoreGroupTerminalBalanceModule } from '../../Core/group-terminal-balance/group-tv.module';
import { GroupCoreModule } from '../../Core/group/group.module';
import { MerchantcoreModule } from '../../Core/merchant/merchantcore.module';
import { GeneralService } from '../../Core/service/general.service';
import { BalanceTerminalController } from './controller/terminal-balance.controller';
import { BalanceUserController } from './controller/user.controller';
import { BalanceGroupTerminalApiService } from './services/group-terminal.service';
import { BalanceTerminalApiService } from './services/terminal-balance.service';

@Module({
  imports: [CoreGroupTerminalBalanceModule, GroupCoreModule, MerchantcoreModule],
  controllers: [BalanceTerminalController, BalanceUserController],
  providers: [GeneralService, BalanceTerminalApiService, BalanceGroupTerminalApiService],
})
export class BalanceApiModule {}
