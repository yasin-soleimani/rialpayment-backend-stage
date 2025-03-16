import { Global, Module } from '@vision/common';
import { DatabaseModule } from '../../../Database/database.module';
import { TokenCoreCommonService } from './services/common.service';
import { TokenProviders } from './token.providers';
import { TokenService } from './token.service';

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [...TokenProviders, TokenService, TokenCoreCommonService],
  exports: [TokenService],
})
export class TokenModule {}
