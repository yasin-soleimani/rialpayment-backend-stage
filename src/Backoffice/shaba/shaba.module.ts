import { Module } from '@vision/common';
import { ShabaService } from './shaba.service';
import { DatabaseModule } from '../../Database/database.module';
import { ShabaController } from './shaba.controller';
import { ShabacoreService } from '../../Core/shaba/shabacore.service';
import { ShabacoreProviders } from '../../Core/shaba/shabacore.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [ShabaController],
  providers: [ShabaService, ShabacoreService, ...ShabacoreProviders],
})
export class ShabaModule {}
