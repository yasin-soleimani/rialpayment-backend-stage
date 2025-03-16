import { Module } from '@vision/common';
import { LoginHistoryModule } from '../../Core/useraccount/history/login-history.module';
import { BackofficeHistoryController } from './history.controller';
import { BackofficeHistoryService } from './history.service';
import { GeneralService } from '../../Core/service/general.service';

@Module({
  imports: [LoginHistoryModule],
  controllers: [BackofficeHistoryController],
  providers: [BackofficeHistoryService, GeneralService],
  exports: [],
})
export class BackofficeHistoryModule {}
