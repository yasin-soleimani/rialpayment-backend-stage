import { Injectable } from '@vision/common';
import { NewmipgRequestDto } from './dto/newmipg-request.dto';
import { MipgCoreService } from '../../Core/mipg/mipg.service';
import { IpgCoreService } from '../../Core/ipg/ipgcore.service';
import { newMipgRequestValidation } from './function/validation.function';

@Injectable()
export class NewMipgService {
  constructor(private readonly mipgService: MipgCoreService, private readonly ipgService: IpgCoreService) {}

  async requestTransaction(getInfo: NewmipgRequestDto, req: Request): Promise<any> {}
}
