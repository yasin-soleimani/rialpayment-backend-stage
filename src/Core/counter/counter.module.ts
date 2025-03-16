import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { CounterProviders } from './counter.providers';
import { CounterCoreService } from './counter.service';

@Module({
  imports: [DatabaseModule],
  providers: [...CounterProviders, CounterCoreService],
  exports: [CounterCoreService],
})
export class CounterCoreModule {}
