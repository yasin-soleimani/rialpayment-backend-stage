import { Module } from '@vision/common';
import { CardmanagementcoreService } from './cardmanagementcore.service';
import { CardmanagementcoreProviders } from './cardmanagementcore.providers';
import { DatabaseModule } from '../../Database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [CardmanagementcoreService, ...CardmanagementcoreProviders],
  exports: [CardmanagementcoreService],
})
export class CardmanagementcoreModule {}
