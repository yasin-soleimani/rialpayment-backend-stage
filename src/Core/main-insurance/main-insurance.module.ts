import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { MainInsuranceProviders } from './main-insurance.providers';
import { MainInsuranceCategoryCoreService } from './services/category.service';
import { MainInsuranceProductCoreService } from './services/products.service';
import { MainInsuranceCompanyCoreService } from './services/company.service';
import { MainInsuranceDetailsCoreService } from './services/details.service';
import { MainInsuranceHistoryCoreService } from './services/history.service';

@Module({
  imports: [DatabaseModule],
  providers: [
    MainInsuranceCategoryCoreService,
    MainInsuranceProductCoreService,
    MainInsuranceCompanyCoreService,
    MainInsuranceDetailsCoreService,
    MainInsuranceHistoryCoreService,
    ...MainInsuranceProviders,
  ],
  exports: [MainInsuranceCategoryCoreService, MainInsuranceProductCoreService, MainInsuranceHistoryCoreService],
})
export class MainInsuranceCoreModule {}
