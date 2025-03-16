import { Module } from '@vision/common';
import { NahabController } from './nahab.controller';
import { NahabService } from './nahab.service';
import { ApiPermCoreModule } from '../../../Core/apiPerm/apiPerm.module';
import { AccountModule } from '../../../Core/useraccount/account/account.module';
import { RequestCoreModule } from '../../../Core/request/request.module';

@Module({
  imports: [ApiPermCoreModule, AccountModule, RequestCoreModule],
  controllers: [NahabController],
  providers: [NahabService],
})
export class NahabModule {}
