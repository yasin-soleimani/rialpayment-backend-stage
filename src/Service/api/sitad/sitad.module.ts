import { Module } from '@vision/common';
import { DatabaseModule } from '../../../Database/database.module';
import { ApiPermCoreService } from '../../../Core/apiPerm/apiPerm.service';
import { ApiPermProviders } from '../../../Core/apiPerm/apiPerm.providers';
import { GeneralService } from '../../../Core/service/general.service';
import { SitadCoreService } from '../../../Core/sitad/sitad.service';
import { SitadCoreProviders } from '../../../Core/sitad/sitad.providers';
import { SitadApiService } from './sitad.service';
import { SitadApiController } from './sitad.controller';
import { AccountModule } from '../../../Core/useraccount/account/account.module';

@Module({
  imports: [DatabaseModule, AccountModule],
  controllers: [SitadApiController],
  providers: [
    SitadApiService,
    ApiPermCoreService,
    GeneralService,
    SitadCoreService,
    ...SitadCoreProviders,
    ...ApiPermProviders,
  ],
})
export class SitadApiModule {}
