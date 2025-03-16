import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { BillInquiryCoreService } from './bill-inquiry.service';
import { BillInquiryGasCoreService } from './services/gas.service';
import { BillInquiryProviders } from './bill-inquiry.providers';
import { BillInquiryCommonService } from './services/common.service';
import { BillInquiryWaterCoreService } from './services/water.service';
import { BillInquiryElectricCoreService } from './services/electric.service';
import { BillInquiryMCICoreService } from './services/mci.service';
import { BillInqiuryCarCrimeService } from './services/car-crime.service';
import { BillInquiryListCoreService } from './services/list.service';
import { BillInquiryPhoneCoreService } from './services/phone.service';
import { BillInquiryPaymentCoreService } from './payment/payment.service';
import { BillInquiryNewPaymentCoreService } from './payment/new-payment.service';

@Module({
  imports: [DatabaseModule],
  providers: [
    BillInquiryCoreService,
    BillInquiryGasCoreService,
    BillInquiryWaterCoreService,
    BillInquiryElectricCoreService,
    BillInquiryMCICoreService,
    BillInqiuryCarCrimeService,
    BillInquiryCommonService,
    BillInquiryListCoreService,
    BillInquiryPhoneCoreService,
    BillInquiryPaymentCoreService,
    BillInquiryNewPaymentCoreService,
    ...BillInquiryProviders,
  ],
  exports: [
    BillInquiryCoreService,
    BillInquiryGasCoreService,
    BillInquiryListCoreService,
    BillInquiryPaymentCoreService,
    BillInquiryNewPaymentCoreService,
    BillInquiryCommonService,
  ],
})
export class BillInquiryCoreModule {}
