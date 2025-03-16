import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  successOptWithDataNoValidation,
  successOptWithPagination,
} from '@vision/common';
import { GeneralService } from '../../Core/service/general.service';
import { CardService } from '../../Core/useraccount/card/card.service';
import { TicketsCoreService } from '../../Core/tickets/tickets.service';
import * as moment from 'jalali-moment';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { MerchantTerminalPosInfoService } from '../../Core/merchant/services/merchant-terminal-pos-info.service';
import { PosPayRequestDto } from '../pos/dto/pay-req.dto';

@Injectable()
export class TicketsService {
  constructor(
    private readonly generalService: GeneralService,
    private readonly cardService: CardService,
    private readonly ticketsCoreService: TicketsCoreService,
    private readonly termninalService: MerchantTerminalPosInfoService
  ) {}

  async payTicket(getInfo: PosPayRequestDto) {
    const posInfo = await this.termninalService.getInfoByMac(getInfo.mac);
    if (!posInfo) throw new UserCustomException('پذیرنده نامعتبر', false, 500);
    if (posInfo.terminal.status == false || posInfo.terminal.merchant.status == false)
      throw new UserCustomException('پذیرنده نامعتبر');

    const cardInfo = await this.cardService.getCardInfo(getInfo.cardno);
    if (!cardInfo || cardInfo.cardno != getInfo.cardno) throw new UserCustomException('کارت نامعتبر');
    if (cardInfo.status == false) throw new UserCustomException('کارت غیرفعال می باشد');
    //if (cardInfo.secpin != Number(getInfo.secpin)) throw new UserCustomException('کارت نامعتبر');

    const today = moment().locale('fa').day();
    const cardLastTicket = await this.ticketsCoreService.getLastTicketByCardIdAndTerminal(
      cardInfo._id,
      posInfo.terminal._id,
      today
    );
    if (!cardLastTicket) throw new NotFoundException('بلیط برای شما یافت نشد');
    const expire = moment(cardLastTicket.expire);
    if (expire < moment(new Date())) throw new UserCustomException('اعتبار بلیط شما به پایان رسیده است');
    if (cardLastTicket.remainCount <= 0) throw new UserCustomException('موجودی بلیط کافی نمیباشد');
    if (!cardLastTicket.terminals.includes(posInfo.terminal._id))
      throw new NotFoundException('بلیط برای شما در این پذیرنده یافت نشد');

    if (!cardLastTicket.daysofweek.includes(today))
      throw new UserCustomException('این بلیط برای امروز قابل استفاده نمیباشد');
    const lastTicketTransaction = await this.ticketsCoreService.getLastHistoryByCard(
      cardInfo._id,
      posInfo.terminal._id
    );
    if (lastTicketTransaction) {
      const lastDate = moment(lastTicketTransaction.createdAt).locale('fa').format('YYYY/MM/DD');
      const nowDate = moment(new Date()).locale('fa').format('YYYY/MM/DD');
      console.log('lastDate: ', lastDate, 'now Date: ', nowDate);
      /*if (
        !cardLastTicket.canUseMultiTime &&
        lastDate === nowDate &&
        lastTicketTransaction.ticket.toString() == cardLastTicket._id.toString()
      )
        throw new UserCustomException('بلیط امروز قبلا استفاده شده است');*/
      const diffSec = moment(new Date().getTime()).diff(lastTicketTransaction.createdAt, 'seconds');
      console.log('diff sec ', diffSec);
      if (diffSec < 10)
        throw new UserCustomException('تراکنش تکراری! دوباره بعد از ' + (10 - diffSec) + ' ثانیه امتحان کنید');
    }
    const updatedTicket = await this.ticketsCoreService.decreaseTicketCount(cardLastTicket._id);
    console.log('updatedTicket:::: ', updatedTicket);
    if (!updatedTicket || cardLastTicket.remainCount === updatedTicket.remainCount)
      throw new InternalServerErrorException();
    const insertTicketHistory = await this.ticketsCoreService.createTicketHistory({
      ticket: cardLastTicket._id,
      card: cardInfo._id,
      cardnumber: cardInfo.cardno,
      terminal: posInfo.terminal._id,
      user: cardInfo.user ?? null,
    });
    if (insertTicketHistory)
      return successOptWithDataNoValidation({
        expire: updatedTicket.expire,
        terminalTitle: posInfo.terminal.title,
        remainCount: updatedTicket.remainCount,
        totalCount: updatedTicket.totalCount,
      });
    else throw new InternalServerErrorException();
  }

  async getTransactions(mac: string, start, end, page = 1) {
    const posInfo = await this.termninalService.getInfoByMac(mac);
    if (!posInfo) throw new UserCustomException('پذیرنده نامعتبر', false, 500);
    if (posInfo.terminal.status == false || posInfo.terminal.merchant.status == false)
      throw new UserCustomException('پذیرنده نامعتبر');
    const transactions = await this.ticketsCoreService.getTicketsHistoriesByTerminal(
      posInfo.terminal._id,
      start,
      end,
      page
    );
    return successOptWithDataNoValidation(transactions);
  }

  async getRemain(mac, cardno) {
    const posInfo = await this.termninalService.getInfoByMac(mac);
    if (!posInfo) throw new UserCustomException('پذیرنده نامعتبر', false, 500);
    if (posInfo.terminal.status == false || posInfo.terminal.merchant.status == false)
      throw new UserCustomException('پذیرنده نامعتبر');

    const cardInfo = await this.cardService.getCardInfo(cardno);
    if (!cardInfo || cardInfo.cardno != cardno) throw new UserCustomException('کارت نامعتبر');
    if (cardInfo.status == false) throw new UserCustomException('کارت غیرفعال می باشد');

    const remain = await this.ticketsCoreService.getTicketChargesByCardIdAndTerminal(
      cardInfo._id,
      posInfo.terminal._id
    );

    if (!remain) throw new UserCustomException('بلیط برای شما یافت نشد');
    return successOptWithDataNoValidation({ ...remain, terminalTitle: posInfo.terminal.title });
  }
}
