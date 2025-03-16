import { Module } from '@vision/common';
import { AccountModule } from '../../Core/useraccount/account/account.module';
import { BackofficeAccountBlockController } from './account-block.controller';
import { BackofficeAccountBlockService } from './account-block.service';
import { GeneralService } from '../../Core/service/general.service';

@Module({
  imports: [AccountModule],
  controllers: [BackofficeAccountBlockController],
  providers: [BackofficeAccountBlockService, GeneralService],
})
export class BackofficeAccountBlockModule {}
