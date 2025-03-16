import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { PlatnoCoreService } from './platno.service';
import { PlatnoProviders } from './plateno.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [PlatnoCoreService, ...PlatnoProviders],
  exports: [PlatnoCoreService],
})
export class PlatnoCoreModule {}
