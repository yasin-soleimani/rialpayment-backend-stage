import { Module } from '@vision/common';
import { IdentifyCoreModule } from '../../Core/useraccount/identify/identify.module';
import { IdentifyApiController } from './identify.controller';
import { IdentifyApiService } from './identify.service';
import { GeneralService } from '../../Core/service/general.service';
import { UserModule } from '../../Core/useraccount/user/user.module';
import { IdentifyUploadImgApiService } from './services/upload.service';

@Module({
  imports: [IdentifyCoreModule, UserModule],
  controllers: [IdentifyApiController],
  providers: [IdentifyUploadImgApiService, IdentifyApiService, GeneralService],
})
export class IdentifyApiModule {}
