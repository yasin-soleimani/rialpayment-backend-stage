import { Module } from '@vision/common';
import { IpgCoreModule } from '../../Core/ipg/ipgcore.module';
import { MipgModule } from '../../Core/mipg/mipg.module';
import { DirectIpgService } from './driect-ipg.service';
import { DirectIpgController } from './direct-ipg.controller';
import { AccountModule } from '../../Core/useraccount/account/account.module';
import { DirectIpgWageService } from './services/wage.service';

@Module({
  imports: [IpgCoreModule, MipgModule, AccountModule],
  controllers: [DirectIpgController],
  providers: [DirectIpgService, DirectIpgWageService],
  exports: [],
})
export class DirectIpgModule {}
