import { Module } from '@vision/common';
import { CardService } from './card.service';
import { CardProviders } from './card.providers';
import { DatabaseModule } from '../../../Database/database.module';
import { GeneralService } from '../../service/general.service';
import { CardcounterModule } from '../cardcounter/cardcounter.module';
import { UserModule } from '../user/user.module';
import { CardDynamicPassCoreService } from './services/dynamic-pass.service';
import { CardTransferCoreService } from './services/cardTransfer.service';
import { CardChargeHistoryCoreService } from './services/card-history.service';
import { CardQrCoreService } from './services/card-qr.service';

@Module({
  imports: [DatabaseModule, CardcounterModule, UserModule],
  providers: [
    CardService,
    GeneralService,
    CardDynamicPassCoreService,
    CardChargeHistoryCoreService,
    CardTransferCoreService,
    CardQrCoreService,
    ...CardProviders,
  ],
  exports: [CardDynamicPassCoreService, CardTransferCoreService, CardChargeHistoryCoreService, CardService, CardQrCoreService],
})
export class CardModule { }
