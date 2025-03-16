import { Module } from '@vision/common';
import { GroupCoreModule } from '../../Core/group/group.module';
import { GroupsBackofficeController } from './groups.controller';
import { GroupsBackofficeService } from './services/groups.service';
import { GroupsCommonBackofficeService } from './services/common.service';
import { GeneralService } from '../../Core/service/general.service';

@Module({
  imports: [GroupCoreModule],
  controllers: [GroupsBackofficeController],
  providers: [GeneralService, GroupsCommonBackofficeService, GroupsBackofficeService],
})
export class BackofficeGroupsModule {}
