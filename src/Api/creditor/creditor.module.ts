import { Module } from '@vision/common';
import { CreditorCoreModule } from '../../Core/creditor/creditor.module';
import { CreditorSubjectApiController } from './controller/subject.controller';
import { GeneralService } from '../../Core/service/general.service';
import { CreditorSubjectApiService } from './services/subject.service';
import { CreditorApiController } from './controller/creditor.controller';
import { CreditorApiService } from './services/creditor.service';
import { AnalyzeCardCoreModule } from '../../Core/analyze/card/analyze-card.module';
import { PspverifyCoreModule } from '../../Core/psp/pspverify/pspverifyCore.module';
import { CardModule } from '../../Core/useraccount/card/card.module';
import { MerchantcoreModule } from '../../Core/merchant/merchantcore.module';

@Module({
  imports: [CreditorCoreModule, AnalyzeCardCoreModule, PspverifyCoreModule, MerchantcoreModule, CardModule],
  controllers: [CreditorSubjectApiController, CreditorApiController],
  providers: [GeneralService, CreditorSubjectApiService, CreditorApiService],
})
export class CreditorApiModule {}
