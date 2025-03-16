import { Injectable, Inject } from '@vision/common';

@Injectable()
export class NewIpgIpgListCommonService {
  constructor(@Inject('IpgListModel') private readonly ipgListModel: any) {}
}
