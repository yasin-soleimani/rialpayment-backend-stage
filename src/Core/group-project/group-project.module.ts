import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { GroupProjectCoreService } from './group-project.service';
import { GroupProjectProviders } from './group-project.providers';
import { BanksCoreModule } from '../banks/banks.module';
import { GroupProjectTargetCoreService } from './services/group-project-target.service';

@Module({
  imports: [DatabaseModule, BanksCoreModule],
  providers: [GroupProjectCoreService, GroupProjectTargetCoreService, ...GroupProjectProviders],
  exports: [GroupProjectCoreService, GroupProjectTargetCoreService],
})
export class GroupProjectCoreModule {}
