import { Module } from '@vision/common';
import { ShaparakApiController } from './shaparak.controller';
import { ShaparakApiService } from './shaparak.service';
import { ShaparakSettlementModule } from '../../Core/shaparak/settlement/settlement.module';

@Module({
  imports: [ShaparakSettlementModule],
  controllers: [ShaparakApiController],
  providers: [ShaparakApiService],
  exports: [],
})
export class ShaparakApiModule {}
