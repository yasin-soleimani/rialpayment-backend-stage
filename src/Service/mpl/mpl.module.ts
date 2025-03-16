import { Module } from '@vision/common';
import { MplController } from './mpl.controller';
import { GeneralService } from '../../Core/service/general.service';
import { MplService } from './mpl.service';
import { IpgCoreModule } from '../../Core/ipg/ipgcore.module';
import { MipgModule } from '../../Core/mipg/mipg.module';
import { UserModule } from '../../Core/useraccount/user/user.module';
import { CardmanagementcoreModule } from '../../Core/cardmanagement/cardmanagementcore.module';
import { SettingsCoreModule } from '../../Core/settings/settings.module';

@Module({
  imports: [IpgCoreModule, UserModule, CardmanagementcoreModule, SettingsCoreModule],
  controllers: [MplController],
  providers: [GeneralService, MplService],
})
export class MplModule {}
