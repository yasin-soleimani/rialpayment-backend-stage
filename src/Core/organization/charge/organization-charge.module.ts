import { Module } from '@vision/common';
import { DatabaseModule } from '../../../Database/database.module';
import { OrganizationChargeService } from './organization-charge.service';
import { OrganizationChargeProviders } from './organization-charge.providers';

@Module({
  imports: [DatabaseModule],
  providers: [OrganizationChargeService, ...OrganizationChargeProviders],
  exports: [OrganizationChargeService],
})
export class OrganizationChargeCoreModule {}
