import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { FileManagerProviders } from './file-manager.providers';
import { FileManagerCoreService } from './file-manager.service';

@Module({
  imports: [DatabaseModule],
  providers: [FileManagerCoreService, ...FileManagerProviders],
  exports: [FileManagerCoreService],
})
export class FileManagerCoreModule {}
