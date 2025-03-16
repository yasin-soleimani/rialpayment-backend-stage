import { Module } from '@vision/common';
import { NationalCoreModule } from '../../Core/national/national.module';
import { NationalController } from './national.controller';
import { NationalApiService } from './national.service';
import { GeneralService } from '../../Core/service/general.service';
import { NationalUploadImgApiService } from './services/upload-img.service';

@Module({
  imports: [NationalCoreModule],
  controllers: [NationalController],
  providers: [NationalApiService, GeneralService, NationalUploadImgApiService],
})
export class NationalApiModule {}
