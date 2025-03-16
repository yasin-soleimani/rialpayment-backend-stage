import { Module } from '@vision/common';
import { CardcounterService } from './cardcounter.service';
import { CardcounterProviders } from './cardcounter.providers';
import { DatabaseModule } from '../../../Database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [CardcounterService, ...CardcounterProviders],
  exports: [CardcounterService],
})
export class CardcounterModule {}
