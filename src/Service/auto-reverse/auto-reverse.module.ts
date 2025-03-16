import { Module } from '@vision/common';
import { PspverifyCoreModule } from '../../Core/psp/pspverify/pspverifyCore.module';
import { AutoReverseSystemServiceController } from './auto-reverse.controller';
import { AutoReverseSystemService } from './auto-reverse.service';

@Module({
  imports: [PspverifyCoreModule],
  controllers: [AutoReverseSystemServiceController],
  providers: [AutoReverseSystemService],
})
export class AutoReverseSystemServiceSystem {}
