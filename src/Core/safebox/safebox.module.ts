import { Module, forwardRef } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { SafeboxCoreService } from './safebox.sevice';
import { SafeboxProviders } from './safebox.providers';
import { AccountModule } from '../useraccount/account/account.module';
import { LoggercoreModule } from '../logger/loggercore.module';

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [SafeboxCoreService, ...SafeboxProviders],
  exports: [SafeboxCoreService],
})
export class SafeboxCoreModule {}
