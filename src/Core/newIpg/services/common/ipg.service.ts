import { Injectable, Inject } from '@vision/common';

@Injectable()
export class NewIpgCommonService {
  constructor(@Inject('IpgModel') private readonly IpgModel: any) {}
}
