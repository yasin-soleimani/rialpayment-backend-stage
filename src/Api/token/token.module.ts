import { Module } from '@vision/common';
import { GeneralService } from '../../Core/service/general.service';
import { TokenApiController } from './token.controller';
import { TokenApiService } from './token.service';

@Module({
  imports: [],
  controllers: [TokenApiController],
  providers: [GeneralService, TokenApiService],
})
export class TokenApiModule {}
