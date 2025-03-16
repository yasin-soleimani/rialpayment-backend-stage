import { Module } from '@vision/common';
import { MainInsuranceCoreModule } from '../../Core/main-insurance/main-insurance.module';
import { InsuranceApiController } from './insurance.controller';
import { InsuranceApiService } from './insurance.service';
import { InsuranceGetListApiService } from './services/get-list.service';
import { GeneralService } from '../../Core/service/general.service';
import { InsuranceHistoryApiService } from './services/history.service';
import { InsurancePaymentApiService } from './services/payment.service';
import { UserModule } from '../../Core/useraccount/user/user.module';
import { AccountModule } from '../../Core/useraccount/account/account.module';
import { InternetPaymentGatewayServiceModule } from '../../Service/internet-payment-gateway/ipg.module';
import { InsuranceRedirectApiService } from './services/redirect.service';
import { InsuranceVerifyApiService } from './services/verify.service';
import { IpgCoreModule } from '../../Core/ipg/ipgcore.module';

@Module({
  imports: [MainInsuranceCoreModule, InternetPaymentGatewayServiceModule, UserModule, AccountModule, IpgCoreModule],
  controllers: [InsuranceApiController],
  providers: [
    InsuranceGetListApiService,
    InsuranceApiService,
    InsuranceRedirectApiService,
    InsuranceHistoryApiService,
    InsurancePaymentApiService,
    InsuranceVerifyApiService,
    GeneralService,
  ],
})
export class InsuranceApiModule {}
