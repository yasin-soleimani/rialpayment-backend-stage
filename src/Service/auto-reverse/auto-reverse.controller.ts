import { Controller } from '@vision/common/decorators/core/controller.decorator';
import { PspverifyCoreService } from '../../Core/psp/pspverify/pspverifyCore.service';

@Controller('auto-reverse-system')
export class AutoReverseSystemServiceController {
  constructor(private readonly pspVerifyService: PspverifyCoreService) {}

  async getAll(): Promise<any> {}
}
