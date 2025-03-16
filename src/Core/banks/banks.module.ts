import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { BanksCoreService } from './banks.service';
import { BanksProviders } from './banks.providers';

@Module({
  imports: [DatabaseModule],
  providers: [BanksCoreService, ...BanksProviders],
  exports: [BanksCoreService],
})
export class BanksCoreModule {}
