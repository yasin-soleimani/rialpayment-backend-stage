import { Module } from '@vision/common';
import { VersionController } from './version.controller';

@Module({
  imports: [],
  controllers: [VersionController],
  providers: [],
})
export class VersionModule {}
