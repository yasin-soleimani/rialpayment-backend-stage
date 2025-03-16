import { Module } from '@vision/common';
import { MipgController } from './mipg.controller';
import { DatabaseModule } from '../../Database/database.module';
import { GeneralService } from '../../Core/service/general.service';
import { MipgBackOfficeService } from './mipg.service';
import { IpgCoreModule } from '../../Core/ipg/ipgcore.module';
import { MipgModule } from '../../Core/mipg/mipg.module';
import { AclCoreModule } from '../../Core/acl/acl.module';

@Module({
  imports: [DatabaseModule, IpgCoreModule, MipgModule, AclCoreModule],
  controllers: [MipgController],
  providers: [MipgBackOfficeService, GeneralService],
})
export class MipgBOModule {}
