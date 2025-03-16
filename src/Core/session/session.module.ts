import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { SessionService } from './session.service';
import { SessionProvides } from './session.providers';

@Module({
  imports: [DatabaseModule],
  providers: [SessionService, ...SessionProvides],
  exports: [SessionService],
})
export class SessionModule {}
