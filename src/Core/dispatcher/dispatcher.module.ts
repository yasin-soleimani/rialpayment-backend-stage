import { Module, Global } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { DispatcherCoreProviders } from './dispatcher.providers';
import { DispatcherCoreService } from './dispatcher.service';
@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [DispatcherCoreService, ...DispatcherCoreProviders],
  exports: [DispatcherCoreService],
})
export class DispatcherCoreModule {}
