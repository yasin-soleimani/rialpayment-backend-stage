import { Model } from 'mongoose';
import { Injectable, Inject } from '@vision/common';
import { CardCounter } from './interfaces/cardcounter.interface';

@Injectable()
export class CardcounterService {
  constructor(@Inject('CardCounterModel') private readonly cardCounterModel: Model<CardCounter>) {}

  async getCardNumber(): Promise<any> {
    return await this.cardCounterModel.findOne({ _id: 'entityId' }, (error, value) => {
      if (error) return error;
      if (!value) {
        this.cardCounterModel
          .create({ _id: 'entityId', seq: 141272131111111, acc: 1 })
          .then((newfinal) => {
            return newfinal;
          })
          .catch((err) => {
            return err;
          });
      } else {
        this.cardCounterModel
          .findByIdAndUpdate(value._id, { $inc: { seq: 1 } })
          .then((final) => {
            return final;
          })
          .catch((err) => {
            return err;
          });
      }
    });
  }

  async getNumbersCards(): Promise<any> {
    return this.cardCounterModel
      .findOneAndUpdate({ _id: 'entityId' }, { $inc: { seq: 1 } })
      .then((final) => {
        return final;
      })
      .catch((err) => {
        return err;
      });
  }

  async getNumbersAccounts(): Promise<any> {
    return this.cardCounterModel
      .findOneAndUpdate({ _id: 'entityId' }, { $inc: { acc: 1 } })
      .then((final) => {
        return final;
      })
      .catch((err) => {
        return err;
      });
  }

  async getTSerialNumber(): Promise<any> {
    // return this.cardCounterModel.find({  } );
    return this.cardCounterModel.findOneAndUpdate({ _id: 'entityId' }, { $inc: { tserial: 1 } });
  }

  async getNationalIdCode(): Promise<any> {
    return this.cardCounterModel.findOneAndUpdate({ _id: 'entityId' }, { $inc: { idcode: 1 } });
  }

  async getAccountNumber(): Promise<any> {
    return await this.cardCounterModel.findOne({ _id: 'entityId' }, (error, value) => {
      if (error) return error;
      if (!value) {
        this.cardCounterModel
          .create({ _id: 'entityId', seq: 141272131111111, acc: 1 })
          .then((newfinal) => {
            return newfinal;
          })
          .catch((err) => {
            return err;
          });
      } else {
        const x = value.acc + 1;
        this.cardCounterModel
          .findByIdAndUpdate(value._id, { acc: x })
          .then((final) => {
            return final;
          })
          .catch((err) => {
            return err;
          });
      }
    });
  }

  async getTranxID(): Promise<any> {
    return this.cardCounterModel.findOneAndUpdate({ _id: 'entityId' }, { $inc: { traxid: 1 } }, { new: true });
  }

  async getAgentRef(): Promise<any> {
    return this.cardCounterModel.findOneAndUpdate({ _id: 'entityId' }, { $inc: { refagent: 1 } }, { new: true });
  }

  async getUserRef(): Promise<any> {
    return this.cardCounterModel.findOneAndUpdate({ _id: 'entityId' }, { $inc: { refuser: 1 } }, { new: true });
  }

  async getTerminal(): Promise<any> {
    const data = await this.cardCounterModel.findOneAndUpdate(
      { _id: 'entityId' },
      { $inc: { terminal: 1 } },
      { new: true }
    );

    return data.terminal;
  }

  async getMerchant(): Promise<any> {
    const data = await this.cardCounterModel.findOneAndUpdate(
      { _id: 'entityId' },
      { $inc: { merchant: 1 } },
      { new: true }
    );

    return data.merchant;
  }
}
