import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { NationalCoreModule } from '../national/national.module';
import { UserModule } from '../useraccount/user/user.module';
import { NationalInsuranceCoreService } from './insurance.service';
import { NationalInsurancePersonCommonService } from './services/person.service';
import { NationalInsuranceProviders } from './insurance.providers';
import { NationalInsuranceCommonService } from './services/insurance.service';
import { NationalInsuranceCategoryService } from './services/category.service';
import { NationalInsuranceCompanyCommonService } from './services/company.service';
import { NationalInsuranceCompleteService } from './module/complete.insurance';
import { NationalInsurancePriceCommonCoreService } from './services/price.service';
import { NationalInsuranceCalcApiService } from '../../Api/nationalInsurance/services/calc.service';

@Module({
  imports: [DatabaseModule, NationalCoreModule, UserModule],
  providers: [
    NationalInsuranceCoreService,
    NationalInsurancePersonCommonService,
    NationalInsuranceCategoryService,
    NationalInsuranceCompanyCommonService,
    NationalInsuranceCommonService,
    NationalInsuranceCompleteService,
    NationalInsurancePriceCommonCoreService,
    NationalInsuranceCalcApiService,
    ...NationalInsuranceProviders,
  ],
  exports: [
    NationalInsuranceCoreService,
    NationalInsuranceCategoryService,
    NationalInsuranceCompanyCommonService,
    NationalInsurancePriceCommonCoreService,
    NationalInsuranceCompleteService,
  ],
})
export class NationalInsuranceCoreModule {}
