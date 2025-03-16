import { Module } from '@vision/common';
import { IpgCoreModule } from '../../Core/ipg/ipgcore.module';
import { MerchantcoreModule } from '../../Core/merchant/merchantcore.module';
import { MipgModule } from '../../Core/mipg/mipg.module';
import { BackofficeMipgController } from './backoffice-mipg.controller';
import { BackofficeMipgService } from './backoffice-mipg.service';

@Module({
  imports: [MerchantcoreModule, MipgModule, IpgCoreModule],
  controllers: [BackofficeMipgController],
  providers: [BackofficeMipgService],
})
export class BackofficeMipgModule {}
