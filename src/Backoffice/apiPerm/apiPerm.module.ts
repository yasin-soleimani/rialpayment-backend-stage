import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { ApiPermController } from './apiPerm.Controller';
import { ApiPermCoreService } from '../../Core/apiPerm/apiPerm.service';
import { ApiPermService } from './apiPerm.Service';
import { ApiPermProviders } from '../../Core/apiPerm/apiPerm.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [ApiPermController],
  providers: [ApiPermCoreService, ApiPermService, ...ApiPermProviders],
})
export class ApiPermModule {}
