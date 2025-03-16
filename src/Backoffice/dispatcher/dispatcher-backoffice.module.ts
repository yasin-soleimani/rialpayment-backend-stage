import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { DispatcherBackofficeService } from './dispatcher-backoffice.service';
import { DispatcherCoreService } from '../../Core/dispatcher/dispatcher.service';
import { DispatcherCoreProviders } from '../../Core/dispatcher/dispatcher.providers';
import { DispatcherBackofficeController } from './dispatcher-backoffice.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [DispatcherBackofficeController],
  providers: [DispatcherBackofficeService, DispatcherCoreService, ...DispatcherCoreProviders],
})
export class DispatcherBackofficeModule {}
