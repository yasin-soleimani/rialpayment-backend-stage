import { Module } from '@vision/common';
import { ClubCoreModule } from '../../Core/customerclub/club.module';

@Module({
  imports: [ClubCoreModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class CustomerClubBackofficeModule {}
