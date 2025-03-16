import { Module } from '@vision/common';
import { DatabaseModule } from '../../../Database/database.module';
import { GroupCoreModule } from '../../../Core/group/group.module';
import { CardProviders } from '../../../Core/useraccount/card/card.providers';
import { AnalyzeCardCoreService } from './services/analyze-card.service';
import { GroupCoreProviders } from '../../../Core/group/group.providers';

@Module({
  imports: [DatabaseModule, GroupCoreModule],
  providers: [...CardProviders, ...GroupCoreProviders, AnalyzeCardCoreService],
  exports: [AnalyzeCardCoreService],
})
export class AnalyzeCardCoreModule {}
