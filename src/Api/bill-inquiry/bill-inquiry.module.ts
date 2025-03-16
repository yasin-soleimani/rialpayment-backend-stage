import { Module } from '@vision/common';
import { BillInquiryCoreModule } from '../../Core/bill-inquiry/bill-inquiry.module';
import { BillInquiryController } from './bill-inquiry.controller';
import { BillInquiryApiService } from './bill-inquiry.service';
import { GeneralService } from '../../Core/service/general.service';
import { SwitchModule } from '../../Switch/next-generation/switch.module';
import { CardModule } from '../../Core/useraccount/card/card.module';
import { BillInquiryPaymentApiService } from './services/payment.service';
import { BillInquirySwitchApiService } from './services/switch.service';
import { PspverifyCoreModule } from '../../Core/psp/pspverify/pspverifyCore.module';
import { LoggercoreModule } from '../../Core/logger/loggercore.module';
import { BillInquiryIpgApiService } from './services/ipg.service';
import { IpgCoreModule } from '../../Core/ipg/ipgcore.module';
import { MipgServiceModule } from '../../Service/mipg/mipg.module';
import { AccountModule } from '../../Core/useraccount/account/account.module';
import { BillInquiryCallbackApiService } from './services/callback.service';
import { ClubpPwaModule } from '../../Core/clubpwa/club-pwa.module';

@Module({
  imports: [
    BillInquiryCoreModule,
    SwitchModule,
    CardModule,
    AccountModule,
    PspverifyCoreModule,
    LoggercoreModule,
    MipgServiceModule,
    IpgCoreModule,
    ClubpPwaModule,
  ],
  controllers: [BillInquiryController],
  providers: [
    BillInquiryApiService,
    BillInquiryPaymentApiService,
    BillInquiryIpgApiService,
    BillInquiryCallbackApiService,
    BillInquirySwitchApiService,
    GeneralService,
  ],
})
export class BillInqiuryApiModule {}
