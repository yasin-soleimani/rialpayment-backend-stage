import { Module } from '@vision/common';
import { NewMipgServiceController } from './newmipg.controller';
import { MipgModule } from '../../Core/mipg/mipg.module';
import { IpgCoreModule } from '../../Core/ipg/ipgcore.module';
import { NewMipgService } from './newmipg.service';

@Module({
  imports: [MipgModule, IpgCoreModule],
  controllers: [NewMipgServiceController],
  providers: [NewMipgService],
})
export class NewMipgServiceModule {}
