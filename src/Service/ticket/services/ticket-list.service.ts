import { Injectable, successOptWithDataNoValidation } from '@vision/common';
import { VoucherListCoreService } from '../../../Core/voucher/services/voucher-list.service';

@Injectable()
export class TicketGetListService {
  constructor(private readonly voucherListService: VoucherListCoreService) {}

  async getList(): Promise<any> {
    const data = await this.voucherListService.getList();
    return successOptWithDataNoValidation(data);
  }
}
