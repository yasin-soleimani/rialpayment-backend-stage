import { Module } from '@vision/common';
import { DatabaseModule } from '../../../Database/database.module';
import { BasketProductService } from './services/product.service';
import { BasketProductProviders } from './product.providers';
import { BasketProductCardFieldsService } from './services/product-card-fields.service';
import { BasketProductDownloadService } from './services/product-download.service';
import { BasketProductPhysicalService } from './services/product-physical.service';
import { BasketProductCommonService } from './services/product-common.service';
import { BasketProductLisenceService } from './services/product-lisence.service';

@Module({
  imports: [DatabaseModule],
  providers: [
    BasketProductService,
    BasketProductCardFieldsService,
    BasketProductDownloadService,
    BasketProductPhysicalService,
    BasketProductLisenceService,
    BasketProductCommonService,
    ...BasketProductProviders,
  ],
  exports: [BasketProductService],
})
export class BasketProductModule {}
