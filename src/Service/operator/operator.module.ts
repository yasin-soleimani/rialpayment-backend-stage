import { Module } from '@vision/common';
import { OperatorCoreModule } from '../../Core/useraccount/operator/operator.module';
import { OperatorController } from './operator.controller';
import { OperatorService } from './operator.service';
import { GeneralService } from '../../Core/service/general.service';
import { VoucherModule } from '../../Core/voucher/voucher.module';

@Module({
  imports: [OperatorCoreModule, VoucherModule],
  controllers: [OperatorController],
  providers: [OperatorService, GeneralService],
})
export class OperatorServiceModule {}
