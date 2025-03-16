import { Module } from '@vision/common';
import { LoggercoreModule } from '../../Core/logger/loggercore.module';
import { BackofficeLoggerController } from './logger.controller';
import { BackofficeLoggerService } from './logger.service';

@Module({
  imports: [LoggercoreModule],
  controllers: [BackofficeLoggerController],
  providers: [BackofficeLoggerService],
  exports: [BackofficeLoggerService],
})
export class BackofficeLoggerModule {}
