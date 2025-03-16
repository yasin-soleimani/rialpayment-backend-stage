import { Module } from '@vision/common';
import { IpgFactoryController } from './ipg.controller';
import { IpgFactoryService } from './ipg.service';
import { MipgModule } from '../../Core/mipg/mipg.module';
import { IpgCoreModule } from '../../Core/ipg/ipgcore.module';

@Module({
  imports: [MipgModule, IpgCoreModule],
  controllers: [IpgFactoryController],
  providers: [IpgFactoryService],
  exports: [],
})
export class IpgFactoryModeul {}
