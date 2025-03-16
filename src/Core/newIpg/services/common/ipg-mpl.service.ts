import { Injectable, Inject } from '@vision/common';

@Injectable()
export class NewIpgMplCommonService {
  constructor(@Inject('') private readonly mplModel: any) {}
}
