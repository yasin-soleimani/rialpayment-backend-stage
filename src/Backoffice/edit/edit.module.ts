import { Module } from '@vision/common';
import { BackofficeEditService } from './edit.service';
import { EditCoreModule } from '../../Core/edit/edit.module';
import { BackofficeEditController } from './edit.controller';
import { GeneralService } from '../../Core/service/general.service';
import { UserModule } from '../../Core/useraccount/user/user.module';

@Module({
  imports: [EditCoreModule, UserModule],
  controllers: [BackofficeEditController],
  providers: [BackofficeEditService, GeneralService],
})
export class BackofficeEditModule {}
