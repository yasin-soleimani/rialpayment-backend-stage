import { Module } from '@vision/common';
import { DatabaseModule } from '../../../Database/database.module';
import { OrganizationStrategyService } from './organization-strategy.service';
import { OrganizationStrategyProviders } from './organization-strategy.providers';

@Module({
  imports: [DatabaseModule],
  providers: [OrganizationStrategyService, ...OrganizationStrategyProviders],
  exports: [OrganizationStrategyService],
})
export class OrganizationStrategyModule {}
