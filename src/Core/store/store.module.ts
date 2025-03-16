import { Module } from '@vision/common';
import { StoreService } from './store.service';
import { StoreProviders } from './store.providers';
import { DatabaseModule } from '../../Database/database.module';
import { CardcounterService } from '../useraccount/cardcounter/cardcounter.service';
import { CardcounterProviders } from '../useraccount/cardcounter/cardcounter.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [StoreService, CardcounterService, ...StoreProviders, ...CardcounterProviders],
})
export class StoreModule {}
