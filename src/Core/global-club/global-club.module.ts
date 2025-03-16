import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { ClubpPwaModule } from '../clubpwa/club-pwa.module';
import { UserModule } from '../useraccount/user/user.module';
import { GlobalClubService } from './global-club.service';

@Module({
  imports: [DatabaseModule, ClubpPwaModule, UserModule],
  providers: [GlobalClubService],
  exports: [GlobalClubService],
})
export class GlobalClubModule {}
