import { Module } from '@vision/common';
import { RahyabCommonCoreService } from './services/common.service';
import { RahyabSendCoreService } from './services/send.service';

@Module({
  imports: [],
  providers: [RahyabCommonCoreService, RahyabSendCoreService],
  exports: [RahyabCommonCoreService, RahyabSendCoreService],
})
export class RahyabCoreModule {}
