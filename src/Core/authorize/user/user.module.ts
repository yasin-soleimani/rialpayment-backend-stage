import { Module } from '@vision/common';
import { DatabaseModule } from '../../../Database/database.module';
import { AuthorizeUserzCoreService } from './user.service';
import { AuthorizeUserProviders } from './user.providers';
import { AuthorizeUserWageService } from './services/user-wage.service';

@Module({
  imports: [DatabaseModule],
  providers: [AuthorizeUserzCoreService, AuthorizeUserWageService, ...AuthorizeUserProviders],
  exports: [AuthorizeUserWageService, AuthorizeUserzCoreService],
})
export class AuthorizeUserCoreModule {}
