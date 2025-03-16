import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { TicketsProvider } from './tickets.provider';
import { TicketsCoreService } from './tickets.service';
import { FileManagerCoreModule } from '../file-manager/file-manager.module';

@Module({
  imports: [DatabaseModule, FileManagerCoreModule],
  providers: [TicketsCoreService, ...TicketsProvider],
  exports: [TicketsCoreService],
})
export class TicketsCoreModule {}
