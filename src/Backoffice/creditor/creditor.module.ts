import { Module } from '@vision/common';
import { CreditorSubjectBackofficeController } from './controller/subject.controller';
import { CreditorSubjectBackofficeService } from './services/subject.service';
import { CreditorCoreModule } from '../../Core/creditor/creditor.module';
import { CreditorBackofficeController } from './controller/creditor.controller';
import { CreditorBackofficeService } from './services/creditor.service';
import { GeneralService } from '../../Core/service/general.service';

@Module({
  imports: [CreditorCoreModule],
  controllers: [CreditorSubjectBackofficeController, CreditorBackofficeController],
  providers: [CreditorSubjectBackofficeService, CreditorBackofficeService, GeneralService],
})
export class BackofficeCreditorModule {}
