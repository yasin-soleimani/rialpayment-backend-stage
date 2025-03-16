import { Module } from '@vision/common';
import { UserModule } from '../../Core/useraccount/user/user.module';
import { ServiceMrsController } from './mrs.controller';
import { ServiceMrsService } from './mrs.service';
import { MipgModule } from '../../Core/mipg/mipg.module';

@Module({
  imports: [UserModule, MipgModule],
  controllers: [ServiceMrsController],
  providers: [ServiceMrsService],
  exports: [],
})
export class ServiceMrsModule {}
