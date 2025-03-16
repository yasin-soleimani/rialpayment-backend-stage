import { Module } from '@vision/common';
import { BackofficeStoreController } from './store.controller';
import { BackofficeStoreService } from './store.service';
import { GeneralService } from '../../Core/service/general.service';

@Module({
  imports: [],
  controllers: [BackofficeStoreController],
  providers: [GeneralService, BackofficeStoreService],
})
export class BackofficeStoreModule {}
