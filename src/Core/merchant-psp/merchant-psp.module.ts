import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { MerchantPspCoreCommonService } from './services/common.service';
import { MerchantPspCoreInquiryService } from './services/inquiry.service';
import { MerchantPspCorePnaDocumentService } from './services/pna/docment.service';
import { MerchantPspCorePnaInquiryService } from './services/pna/inquiry.service';
import { MerchantPspCorePnaSubmitService } from './services/pna/submit.service';
import { MerchantPspCoreSubmitService } from './services/submit.service';
import { MerchantPspProviders } from './merchant-psp.providers';
// this module need to test in test sandbox

@Module({
  imports: [DatabaseModule],
  providers: [
    MerchantPspCoreSubmitService,
    MerchantPspCoreInquiryService,
    MerchantPspCoreCommonService,
    MerchantPspCorePnaDocumentService,
    MerchantPspCorePnaInquiryService,
    MerchantPspCorePnaSubmitService,
    ...MerchantPspProviders,
  ],
  exports: [
    MerchantPspCoreSubmitService,
    MerchantPspCoreInquiryService,
    MerchantPspCoreCommonService,
    MerchantPspCorePnaDocumentService,
    MerchantPspCorePnaInquiryService,
    MerchantPspCorePnaSubmitService,
    ...MerchantPspProviders,
  ],
})
export class MerchantPspCoreModule {}
