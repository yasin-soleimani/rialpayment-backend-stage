import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { ApiPermCoreService } from './apiPerm.service';
import { ApiPermProviders } from './apiPerm.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [ApiPermCoreService, ...ApiPermProviders],
  exports: [ApiPermCoreService],
})
export class ApiPermCoreModule {}
