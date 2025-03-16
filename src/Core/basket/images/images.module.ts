import { Module } from '@vision/common';
import { DatabaseModule } from '../../../Database/database.module';
import { BasketProductImagesService } from './images.service';
import { BasketImagesProviders } from './images.providers';

@Module({
  imports: [DatabaseModule],
  providers: [BasketProductImagesService, ...BasketImagesProviders],
  exports: [BasketProductImagesService],
})
export class BasketImagesCoreModule {}
