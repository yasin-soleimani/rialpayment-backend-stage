import { Module } from '@vision/common';
import { BasketCardsApiController } from './cards.controller';
import { BasketCardsApiServce } from './cards.service';
import { BasketProductsCardsCoreModule } from '../../../Core/basket/cards/cards.module';
import { GeneralService } from '../../../Core/service/general.service';

@Module({
  imports: [BasketProductsCardsCoreModule],
  controllers: [BasketCardsApiController],
  providers: [BasketCardsApiServce, GeneralService],
  exports: [],
})
export class BasketProductCardsApiModule {}
