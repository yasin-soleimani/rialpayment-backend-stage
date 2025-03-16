import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { CreditorCoreService } from './services/creditor.service';
import { CreditorProviders } from './creditor.providers';
import { CreditorSubjectCoreService } from './services/creditor-subject.service';

@Module({
  imports: [DatabaseModule],
  providers: [...CreditorProviders, CreditorCoreService, CreditorSubjectCoreService],
  exports: [CreditorCoreService, CreditorSubjectCoreService],
})
export class CreditorCoreModule {}
