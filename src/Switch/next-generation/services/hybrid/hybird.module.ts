import { Module } from '@vision/common';
import { SwitchHybirdService } from './hybird.service';

@Module({
  imports: [],
  providers: [SwitchHybirdService],
  exports: [SwitchHybirdService],
})
export class HybirdModule {}
