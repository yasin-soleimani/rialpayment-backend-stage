import { AuthModule } from '../auth/auth.module';
import { FileManagerCoreModule } from '../../Core/file-manager/file-manager.module';
import { Module } from '@vision/common';
import { FileManagerApiService } from './file-manager-api.service';
import { FileManagerApiController } from './file-manager-api.controller';
import { GeneralService } from '../../Core/service/general.service';

@Module({
  imports: [AuthModule, FileManagerCoreModule],
  providers: [FileManagerApiService, GeneralService],
  controllers: [FileManagerApiController],
})
export class FileManagerApiModule {}
