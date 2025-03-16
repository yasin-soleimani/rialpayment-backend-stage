import { Injectable, Inject } from '@vision/common';
import { Model } from 'mongoose';
import { AddPosDto } from '../../../Backoffice/pos-management/dto/add-pos.dto';
import { UpdatePosDto } from '../../../Backoffice/pos-management/dto/update-pos.dto';
import { MerchantTerminalPosInfoDocument } from '../interfaces/merchant-terminal-pos-info.interface';

@Injectable()
export class MerchantTerminalPosInfoService {
  constructor(@Inject('MerchantTerminalPosInfoModel') private readonly posModel: any) {}

  async getInfo(serial: string, modelname: string, mac: string): Promise<any> {
    return this.posModel
      .findOne({
        serial: serial,
        modelname: modelname,
        mac: mac,
      })
      .populate({ path: 'terminal', populate: { path: 'merchant', populate: { path: 'user' } } });
  }

  async getInfoByMac(mac: string): Promise<any> {
    return this.posModel
      .findOne({
        mac: mac,
      })
      .populate({ path: 'terminal', populate: { path: 'merchant', populate: { path: 'user' } } });
  }

  async getInfoByTerminal(id: string): Promise<any> {
    return this.posModel.findOne({
      terminal: id,
    });
  }

  async getPopulatedInfoByTerminal(id: string): Promise<any> {
    return this.posModel
      .findOne({
        terminal: id,
      })
      .populate('terminal');
  }

  async create(dto: AddPosDto): Promise<MerchantTerminalPosInfoDocument> {
    return this.posModel.create(dto);
  }

  async connectToTerminal(id: string, merchantTerminalId: string): Promise<any> {
    return this.posModel.findOneAndUpdate({ _id: id }, { $set: { terminal: merchantTerminalId } }, { new: true });
  }

  async update(id: string, dto: UpdatePosDto): Promise<MerchantTerminalPosInfoDocument> {
    return this.posModel.findOneAndUpdate({ _id: id }, { $set: { ...dto } });
  }

  async getAll(page: number, q: string): Promise<any> {
    let aggregate = this.posModel.aggregate();
    aggregate.lookup({
      from: 'merchantterminals',
      localField: 'terminal',
      foreignField: '_id',
      as: 'terminal',
    });
    aggregate.unwind({ path: '$terminal', preserveNullAndEmptyArrays: true });
    aggregate.addFields({ stringTerminalId: { $toString: '$terminal.terminalid' } });
    if (q) {
      const regex = new RegExp(q, 'g');
      aggregate.match({
        $or: [
          { terminal: regex },
          { mac: regex },
          { serial: regex },
          { 'terminal.title': regex },
          { stringTerminalId: regex },
        ],
      });
    }
    aggregate.sort({ createdAt: -1 });
    const options = { page: page, limit: 50 };
    return this.posModel.aggregatePaginate(aggregate, options);
  }

  async getById(posId: string): Promise<any> {
    return this.posModel.findOne({ _id: posId }).populate('terminal');
  }

  async disconnectFromTerminal(posId: string, terminal: string): Promise<any> {
    return this.posModel.findOneAndDelete({ _id: posId, terminal }).populate({ path: 'terminal' });
  }
}
