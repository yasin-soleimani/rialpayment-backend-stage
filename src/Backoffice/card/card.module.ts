import { Module } from '@vision/common';
import { CardModule } from '../../Core/useraccount/card/card.module';
import { BackofficeCardController } from './card.controller';
import { BackofficeCardService } from './card.service';
import { CardmanagementcoreModule } from '../../Core/cardmanagement/cardmanagementcore.module';
import { GeneralService } from '../../Core/service/general.service';

@Module({
  imports: [CardModule, CardmanagementcoreModule],
  controllers: [BackofficeCardController],
  providers: [BackofficeCardService, GeneralService],
  exports: [],
})
export class BackofficeCardModule {}
