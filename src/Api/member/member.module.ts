import { Module } from '@vision/common';
import { RegisterUserModule } from '../../Core/useraccount/register/register-user.module';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';
import { GeneralService } from '../../Core/service/general.service';
import { UserModule } from '../../Core/useraccount/user/user.module';
import { ClubpPwaModule } from '../../Core/clubpwa/club-pwa.module';

@Module({
  imports: [RegisterUserModule, UserModule, ClubpPwaModule],
  controllers: [MemberController],
  providers: [MemberService, GeneralService],
})
export class MemberModule {}
