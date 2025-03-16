import { Inject, Injectable, InternalServerErrorException, successOptWithDataNoValidation } from '@vision/common';
import * as mongoose from 'mongoose';
import { TicketsModel, TicketsSchemaModel } from './models/tickets-model';
import { TicketsHistoryModel, TicketsHistorySchemaModel } from './models/tickets-history.model';
import { AggregatePaginateModel } from '../../utils/types.util';
import * as excel from 'exceljs';
import * as fs from 'fs';
import { todayDay } from '@vision/common/utils/month-diff.util';
import * as jalalimoment from 'jalali-moment';
import { FileManagerTypesEnum } from '../file-manager/enums/file-manager-types-enum';
import { FileManagerStatusEnum } from '../file-manager/enums/file-manager-status-enum';
import { FileManagerCoreService } from '../file-manager/file-manager.service';
import { UPLOAD_URI_USERS } from '../../__dir__';

@Injectable()
export class TicketsCoreService {
  constructor(
    @Inject('TicketsModel') private readonly ticketModel: AggregatePaginateModel<TicketsSchemaModel>,
    @Inject('TicketsHistoryModel')
    private readonly ticketsHistoryModel: AggregatePaginateModel<TicketsHistorySchemaModel>,
    private readonly fileManagerService: FileManagerCoreService
  ) {}

  async bulkInsert(data: TicketsModel[]) {
    return this.ticketModel.insertMany(data);
  }

  async createOne(data: TicketsModel) {
    return this.ticketModel.create(data);
  }

  async createTicketHistory(data: TicketsHistoryModel) {
    return this.ticketsHistoryModel.create(data);
  }

  async getLastTicketByCardId(_id): Promise<TicketsModel & { _id: string }> {
    return this.ticketModel.findOne({ card: _id }).sort({ createdAt: 1 }).populate('user');
  }

  async getLastTicketByCardIdAndTerminal(
    _id,
    terminal: string,
    today: number
  ): Promise<TicketsModel & { _id: string }> {
    return this.ticketModel
      .findOne({
        card: _id,
        terminals: terminal,
        expire: { $gte: new Date().toISOString() },
        remainCount: { $gt: 0 },
        daysofweek: today,
      })
      .sort({ createdAt: 1 })
      .populate('user');
  }

  async getLastHistoryByCard(_id, terminal): Promise<TicketsHistoryModel & { _id: string }> {
    return this.ticketsHistoryModel.findOne({ card: _id, terminal }).sort({ createdAt: -1 }).populate('user');
  }

  async decreaseTicketCount(_id): Promise<TicketsModel> {
    return this.ticketModel.findOneAndUpdate({ _id }, { $inc: { remainCount: -1 } }, { new: true });
  }

  async deChargeTicketCount(_id: string, count: number) {
    const ticket = await this.ticketModel.findOne({ _id });
    let newCount = ticket.remainCount - count;
    let newTotal = ticket.totalCount - count;
    newCount = newCount < 0 ? 0 : newCount;
    newTotal = newTotal < 0 ? 0 : newTotal;
    ticket.remainCount = newCount;
    ticket.totalCount = newTotal;
    ticket.title = ticket.title + '(موجودی این تیکت توسط مدیریت کاهش پیدا کرد)';
    return ticket.save();
  }

  async getTicketChargesByCardIdAndTerminal(cardId, terminal) {
    return this.ticketModel.findOne({ card: cardId, terminals: terminal }).sort({ createdAt: -1 }).lean();
  }

  async getTicketChargesByRefIdAndTerminals(userOrCard, terminals: string[]) {
    return this.ticketModel
      .find({ $or: [{ card: userOrCard }, { user: userOrCard }], terminals: { $in: terminals } })
      .sort({ createdAt: -1 });
  }

  async updateTerminalByIdPush(id, terminals: string[]) {
    return this.ticketModel.findOneAndUpdate({ _id: id }, { $push: { terminals: { $each: terminals } } });
  }

  async getTicketHistoriesBackofiice(query, page) {
    return this.ticketsHistoryModel.paginate(query, {
      page: page,
      limit: 50,
      sort: { createdAt: -1 },
      populate: 'ticket terminal user',
    });
  }

  async getTicketsHistorySummary(start, end, cards, terminals) {
    const aggr = [
      {
        $match: {
          cardnumber: { $in: cards },
          terminal: { $in: terminals },
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: '$terminal',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'merchantterminals',
          localField: '_id',
          foreignField: '_id',
          as: 'terminalInfo',
        },
      },
      {
        $unwind: {
          path: '$terminalInfo',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          _id: 1,
          count: 1,
          'terminalInfo.title': 1,
          'terminalInfo.terminalid': 1,
        },
      },
    ];
    return this.ticketsHistoryModel.aggregate(aggr);
  }

  async getTicketsHistories(fromDate, toDate, cardsNo, terminals, page) {
    let aggregate = this.ticketsHistoryModel.aggregate();
    aggregate.match({
      cardnumber: { $in: cardsNo },
      terminal: { $in: terminals },
      createdAt: { $gte: fromDate, $lte: toDate },
    });
    aggregate.lookup({
      from: 'merchantterminals',
      localField: 'terminal',
      foreignField: '_id',
      as: 'terminalInfo',
    });

    aggregate.unwind({
      path: '$terminalInfo',
      preserveNullAndEmptyArrays: false,
    });

    aggregate.group({
      _id: '$cardnumber',
      usedTickets: { $sum: 1 },
      usedData: {
        $push: {
          date: '$createdAt',
          terminal: { title: '$terminalInfo.title', terminalid: '$terminalInfo.terminalid' },
        },
      },
    });
    aggregate.addFields({
      cardno: '$_id',
    });
    aggregate.project({
      _id: 0,
      cardno: 1,
      usedTickets: 1,
      usedData: 1,
    });
    return this.ticketsHistoryModel.aggregatePaginate(aggregate, { page, sort: { createdAt: -1 }, limit: 50 });
  }

  async getTicketsHistoriesForXls(fromDate, toDate, cardsNo, terminals): Promise<any> {
    return this.ticketsHistoryModel
      .find({
        cardnumber: { $in: cardsNo },
        terminal: { $in: terminals },
        createdAt: { $gte: fromDate, $lte: toDate },
      })
      .sort({ cardnumber: -1 })
      .populate(' terminal')
      .lean();
  }

  async getGroupTicketsHistoryAllExcel(cardno: number[], start, end, page) {
    return this.ticketsHistoryModel.find(
      { cardnumber: { $in: cardno }, createdAt: { $gte: start, $lte: end } },
      {
        page,
        limit: 50,
        sort: { createdAt: -1 },
        populate: 'terminal user',
        select: 'terminal cardnumber user createdAt',
        lean: true,
      }
    );
  }

  async getTicketHistoryChargesByCardNoAll(cardno: number[], start, end, page, withPagination = false) {
    const cardIds = [];
    for (const item of cardno) cardIds.push(mongoose.Types.ObjectId(item));
    start = new Date(Number(start));
    end = new Date(Number(end));
    let aggregate = this.ticketModel.aggregate();

    console.log(start, end);
    aggregate.match({
      card: { $in: cardIds },
      createdAt: { $gte: start, $lte: end },
    });

    aggregate.lookup({
      from: 'merchantterminals',
      localField: 'terminals',
      foreignField: '_id',
      as: 'terminalInfo',
    });

    aggregate.lookup({
      from: 'users',
      localField: 'user',
      foreignField: '_id',
      as: 'userInfo',
    });
    aggregate.unwind({
      path: '$userInfo',
      preserveNullAndEmptyArrays: false,
    });

    aggregate.lookup({
      from: 'cards',
      localField: 'card',
      foreignField: '_id',
      as: 'cardInfo',
    });
    aggregate.unwind({
      path: '$cardInfo',
      preserveNullAndEmptyArrays: false,
    });

    aggregate.project({
      remainCount: 1,
      totalCount: 1,
      daysofweek: 1,
      canUseMultiTime: 1,
      title: 1,
      expire: 1,
      createdAt: 1,
      'terminalInfo.terminalid': 1,
      'terminalInfo.title': 1,
      'userInfo.fullname': 1,
      'cardInfo.cardno': 1,
    });

    if (!withPagination) return await aggregate.sort({ createdAt: -1 }).exec();
    else return this.ticketModel.aggregatePaginate(aggregate, { page, sort: { createdAt: -1 }, limit: 50 });
    //aggregate.project({});
  }
  async getTicketHistoryByCardNo(cardno, page) {
    return this.ticketsHistoryModel.paginate(
      { cardnumber: cardno },
      { page, limit: 50, sort: { createdAt: -1 }, populate: 'terminal' }
    );
  }

  async getTicketsHistoriesByTerminal(terminal, start, end, page) {
    return this.ticketsHistoryModel
      .find({ terminal: terminal, createdAt: { $gte: start, $lte: end } }, 'cardnumber createdAt user')
      .sort({ createdAt: -1 });
  }

  async getTicketsHistoriesByTerminalAndCount(terminal, start, end, page, cards = []) {
    const query = { terminal: terminal, createdAt: { $gte: start, $lte: end } };
    if (cards.length > 0) query['cardnumber'] = { $in: cards };
    console.log(query);
    const tickets = await this.ticketsHistoryModel.paginate(query, {
      page,
      limit: 50,
      sort: { createdAt: -1 },
      populate: 'user',
      lean: true,
    });
    const count = await this.ticketsHistoryModel.countDocuments(query);
    return {
      totla: count,
      data: tickets,
    };
  }

  async getTicketHistoryTerminalExcel(terminal, start, end, cards = []) {
    const query = {
      terminal: terminal,
      createdAt: { $gte: start, $lte: end },
    };
    if (cards.length > 0) query['cardnumber'] = { $in: cards };
    return this.ticketsHistoryModel.find(query).populate('user').sort({ createdAt: -1 });
  }

  async getLastTicketsHistoryByUser(user, page) {
    return this.ticketsHistoryModel.paginate(
      { user },
      { page, limit: 50, sort: { createdAt: -1 }, populate: 'terminal' }
    );
  }

  async getLastTicketsByUser(user, page) {
    return this.ticketModel.paginate({ user }, { page, limit: 50, sort: { createdAt: -1 }, populate: 'terminals' });
  }
  async getLastTicketByUser(user) {
    return this.ticketModel.findOne({ user }).sort({ createdAt: -1 });
  }

  async getTicketChargesByCardId(card_id, page) {
    return this.ticketModel.paginate(
      { card: card_id },
      { page, limit: 50, sort: { createdAt: -1 }, populate: 'terminals' }
    );
  }

  async makeExcel(data, userid: string, groupId: string, groupName: string): Promise<any> {
    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet('گزارش شارژ ');

    worksheet.columns = [
      { header: 'ردیف', key: 'row', width: 10 },
      { header: 'شماره کارت', key: 'cardno', width: 30 },
      { header: 'نام و نام خانوادگی', key: 'fullname', width: 15 },
      { header: 'تعداد شارژ', key: 'totalCount', width: 10 },
      { header: 'از تاریخ', key: 'createdAt', width: 35 },
      { header: 'تا تاریخ', key: 'expire', width: 35 },
      { header: 'توضیحات', key: 'desc', width: 10 },
      { header: 'گروه', key: 'group', width: 15 },
    ];
    console.log(data, 'result data');

    const result = this.makeResult(data, groupName);
    console.log(result, 'result excel');
    worksheet.addRows(result);

    const today = todayDay();
    const filname = 'charge-tickets' + new Date().getTime() + today + '.xlsx';

    const fileManager = await this.fileManagerService.create({
      user: userid,
      type: FileManagerTypesEnum.EXCEL_TICKET_LIST,
      description: 'گزارش شارژ تیکت ',
      path: userid + '/' + filname,
      additionalType: -1,
      group: groupId,
      status: FileManagerStatusEnum.PENDING,
    });

    this.createFileSync(workbook, userid, filname, fileManager).then();
    return successOptWithDataNoValidation(fileManager);
  }

  async createFileSync(workbook, userid, filname, fileManager) {
    const dir = UPLOAD_URI_USERS + userid;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    const worked = await workbook.xlsx
      .writeFile(dir + '/' + filname)
      .then(() => {
        console.log('file saved!');
        this.fileManagerService.updateStatus(fileManager._id, FileManagerStatusEnum.SUCCESS).then();
      })
      .catch((err) => {
        this.fileManagerService.updateStatus(fileManager._id, FileManagerStatusEnum.ERROR).then();
        throw new InternalServerErrorException();
      });
    const downloadLink = process.env.SITE_URL_EXCEL + userid + '/' + filname;
  }
  private makeResult(data, groupName: string) {
    let tmpArray = Array();

    let counter = 1;
    for (const item of data) {
      let fullname = 'کارت بی نام';
      if (!!item.userInfo) fullname = item.userInfo.fullname;

      tmpArray.push({
        row: counter,
        fullname,
        cardno: item.cardInfo.cardno,
        totalCount: item.totalCount,
        createdAt: jalalimoment(item.createdAt).locale('fa').format('YY/MM/DD'),
        expire: jalalimoment(item.expire).locale('fa').format('YY/MM/DD'),
        desc: item.title,
        group: groupName
      });

      counter++;
    }

    return tmpArray;
  }
}
