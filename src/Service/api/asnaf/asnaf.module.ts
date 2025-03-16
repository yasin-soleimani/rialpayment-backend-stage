import { Module } from '@vision/common';
import { ApiPermCoreModule } from '../../../Core/apiPerm/apiPerm.module';
import { AccountModule } from '../../../Core/useraccount/account/account.module';
import { RequestCoreModule } from '../../../Core/request/request.module';
import { AsnafApiController } from './asnaf.controller';
import { AsnafApiService } from './asnaf.service';

@Module({
  imports: [ApiPermCoreModule, AccountModule, RequestCoreModule],
  controllers: [AsnafApiController],
  providers: [AsnafApiService],
})
export class AsnafServiceModule {}
