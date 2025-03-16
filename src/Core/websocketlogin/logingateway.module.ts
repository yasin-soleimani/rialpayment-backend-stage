import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { LoginGatewayCoreProviders } from './logingateway.providers';
import { LoginGatewayServiceCore } from './logingateway.service';

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [LoginGatewayServiceCore, ...LoginGatewayCoreProviders],
})
export class LoginGatewayModule {}
