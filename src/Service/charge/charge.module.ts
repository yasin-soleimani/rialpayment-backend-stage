import { Module } from '@vision/common';
import { CardModule } from '../../Core/useraccount/card/card.module';
import { ChargeServiceController } from './charge.controller';
import { ServiceChargeService } from './charge.service';
import { MipgModule } from '../../Core/mipg/mipg.module';
import { IpgCoreModule } from '../../Core/ipg/ipgcore.module';
import { ChargeIpgService } from './services/ipg.service';
import { MipgServiceModule } from '../mipg/mipg.module';
import { AccountModule } from '../../Core/useraccount/account/account.module';

@Module({
  imports: [CardModule, MipgModule, MipgServiceModule, IpgCoreModule, AccountModule],
  controllers: [ChargeServiceController],
  providers: [ServiceChargeService, ChargeIpgService],
})
export class ChargeServiceModule {}
