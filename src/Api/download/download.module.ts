import { Module } from '@vision/common';
import { GeneralService } from '../../Core/service/general.service';
import { DownloadService } from './download.service';
import { DownloadController } from './download.controller';
import { BasketShopModule } from '../../Core/basket/shop/shop.module';
import { SessionModule } from '../../Core/session/session.module';

@Module({
  imports: [BasketShopModule, SessionModule],
  controllers: [DownloadController],
  providers: [GeneralService, DownloadService],
})
export class DownloadModule {}
