import { Injectable, Inject } from '@vision/common';
import { AddPosHistoryDto } from '../dto/add-pos-history.dto';
import { MerchantTerminalPosInfoDocument } from '../interfaces/merchant-terminal-pos-info.interface';

@Injectable()
export class MerchantTerminalPosInfoHistoryService {
  constructor(@Inject('MerchantTerminalPosInfoHistoryModel') private readonly posHistoryModel: any) {}

  async getInfo(serial: string, modelname: string, mac: string): Promise<any> {
    return this.posHistoryModel
      .find({
        serial,
        modelname,
        mac,
      })
      .populate([
        {
          path: 'lastTerminal',
          select: { title: 1, _id: 1, terminalid: 1, merchant: 1 },
          populate: { path: 'merchant', select: { title: 1, merchantcode: 1 } },
        },
        {
          path: 'user',
          select: {
            fullname: 1,
            _id: 1,
            mobile: 1,
          },
        },
      ])
      .sort({ createdAt: -1 });
  }

  async create(
    dto: AddPosHistoryDto,
    user: string,
    lastTerminal: string,
    message: string
  ): Promise<MerchantTerminalPosInfoDocument> {
    return this.posHistoryModel.create({ ...dto, message, user, lastTerminal });
  }

  async getAll(page: number, q: string): Promise<any> {
    let aggregate = this.posHistoryModel.aggregate();
    aggregate.lookup({
      from: 'merchantterminals',
      localField: 'lastTerminal',
      foreignField: '_id',
      as: 'lastTerminal',
    });
    aggregate.unwind({ path: '$lastTerminal', preserveNullAndEmptyArrays: true });
    aggregate.addFields({ stringTerminalId: { $toString: '$lastTerminal.terminalid' } });
    if (q) {
      const regex = new RegExp(q, 'g');
      aggregate.match({
        $or: [
          { terminal: regex },
          { mac: regex },
          { serial: regex },
          { 'lastTerminal.title': regex },
          { stringTerminalId: regex },
          { modelname: regex },
          { message: regex },
        ],
      });
    }
    aggregate.sort({ createdAt: -1 });
    const options = { page: page, limit: 50 };
    return this.posHistoryModel.aggregatePaginate(aggregate, options);
  }

  async getById(posId: string): Promise<any> {
    return this.posHistoryModel.findOne({ _id: posId }).populate('lastTerminal');
  }
}
