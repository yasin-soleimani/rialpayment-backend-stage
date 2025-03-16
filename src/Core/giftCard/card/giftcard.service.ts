import { Injectable } from '@vision/common';
import { CardService } from '../../useraccount/card/card.service';
import { CoreGiftCardReportService } from '../report/services/report.service';

@Injectable()
export class CoreGiftcardService {
  constructor(private readonly cardService: CardService, private readonly reportService: CoreGiftCardReportService) {}

  async generate(id: string, userId: string, groupId: string, price: number, discount: number): Promise<any> {
    const data = await this.cardService.genGiftCard(userId, groupId);
    return this.reportService.addCard(id, data._id, price, discount);
  }
}
