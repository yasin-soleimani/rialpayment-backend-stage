import { Module } from '@vision/common';
import { DatabaseModule } from '../../../Database/database.module';
import { BasketStoreCoreService } from './basket-store.service';
import { BasketStoreProviders } from './basket-store.providers';

@Module({
  imports: [DatabaseModule],
  providers: [BasketStoreCoreService, ...BasketStoreProviders],
  exports: [BasketStoreCoreService],
})
export class BasketStoreCoreModule {}
