import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { merchantSettlementProvider } from './providers/merchant-settlement.provider';
import { MerchantSettlementsService } from './services/merchant-settlments.service';
import { MerchantSettlementReportsService } from './services/merchant-settlment-reports.service';
import { MerchantSettlementCashoutService } from './services/merchant-settlement-cashout.service';

@Module({
  imports: [DatabaseModule],
  providers: [
    MerchantSettlementsService,
    MerchantSettlementReportsService,
    MerchantSettlementCashoutService,
    ...merchantSettlementProvider,
  ],
  exports: [MerchantSettlementsService, MerchantSettlementReportsService, MerchantSettlementCashoutService],
})
export class MerchantSettlementCoreModule {}
