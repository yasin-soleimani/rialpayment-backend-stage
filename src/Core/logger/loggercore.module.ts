import { Module } from '@vision/common';
import { LoggercoreService } from './loggercore.service';
import { LoggercoreProviders } from './loggercore.providers';
import { DatabaseModule } from '../../Database/database.module';
import { AccountModule } from '../useraccount/account/account.module';
import { LoggerCoreQueryBuilderService } from './services/filter-query.service';
import { LogegerCoreTodayService } from './services/today-log.service';
import { LoggerCoreReportService } from './services/report.service';

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [
    LoggercoreService,
    LogegerCoreTodayService,
    ...LoggercoreProviders,
    LoggerCoreQueryBuilderService,
    LoggerCoreReportService,
  ],
  exports: [LoggercoreService, LoggerCoreQueryBuilderService, LogegerCoreTodayService, LoggerCoreReportService],
})
export class LoggercoreModule {}
