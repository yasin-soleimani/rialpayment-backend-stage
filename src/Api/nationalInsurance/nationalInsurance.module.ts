import { Module } from '@vision/common';
import { NationalInsuranceCoreModule } from '../../Core/insurance/insurance.module';
import { NartionalInsuranceController } from './nationalInsurance.controller';
import { NationalInsuranceApiService } from './nationalInsurance.service';
import { GeneralService } from '../../Core/service/general.service';
import { NationalInsuranceAuthController } from './controller/auth.controller';
import { NationalInsuranceAuthApiService } from './services/auth.service';
import { UserModule } from '../../Core/useraccount/user/user.module';
import { NationalCoreModule } from '../../Core/national/national.module';
import { NationalInsuranceCalcApiService } from './services/calc.service';
import { MipgServiceModule } from '../../Service/mipg/mipg.module';
import { IpgCoreModule } from '../../Core/ipg/ipgcore.module';
import { NationalInsuranceMakeExcelApiService } from './services/excel.service';

@Module({
  imports: [NationalInsuranceCoreModule, UserModule, NationalCoreModule, IpgCoreModule, MipgServiceModule],
  controllers: [NartionalInsuranceController, NationalInsuranceAuthController],
  providers: [
    NationalInsuranceApiService,
    NationalInsuranceAuthApiService,
    NationalInsuranceCalcApiService,
    NationalInsuranceMakeExcelApiService,
    GeneralService,
  ],
})
export class NationalInsuranceApiModule {}
