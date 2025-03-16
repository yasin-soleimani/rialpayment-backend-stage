import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { ClubPwaProvider } from './club-pwa.provider';
import { ClubPwaService } from './club-pwa.service';

@Module({
  imports: [DatabaseModule],
  providers: [ClubPwaService, ...ClubPwaProvider],
  exports: [ClubPwaService],
})
export class ClubpPwaModule {}
