import { Model } from 'mongoose';
import { Injectable, Inject, InternalServerErrorException, NotFoundException } from '@vision/common';
import { CardmanagementcoreDto } from './dto/cardmanagementcore.dto';
import { CardManagement } from './interfaces/cardmanagement.interface';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { AuthService } from '../../Api/auth/auth.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';

@Injectable()
export class CardmanagementcoreService {
  constructor(@Inject('CardManagementModel') private readonly cardManagementModel: Model<CardManagement>) {}

  private async create(cardmanagementDto: CardmanagementcoreDto): Promise<any> {
    const insertedCard = new this.cardManagementModel(cardmanagementDto);
    return insertedCard.save();
  }

  private async update(cardmanagementDto: CardmanagementcoreDto): Promise<any> {
    return this.cardManagementModel.findOneAndUpdate({ user: cardmanagementDto.user }, cardmanagementDto).exec();
  }

  private async delete(cardnox: number): Promise<any> {
    return this.cardManagementModel.findOneAndRemove({ cardno: cardnox }).exec();
  }

  private async getList(userid): Promise<any> {
    const query = { user: userid };
    return this.cardManagementModel.find(query).select({ cardno: 1, cardownerfullname: 1, _id: 0 }).exec();
  }

  async getAll(): Promise<any> {
    return this.cardManagementModel.find({ $or: [{ status: { $exists: false } }, { status: false }] });
  }

  async updateResp(id, res, status) {
    return this.cardManagementModel.findOneAndUpdate({ _id: id }, { res: res, registerd: status, $inc: { tried: 1 } });
  }

  private async findCard(cardnox: number): Promise<any> {
    return await this.cardManagementModel
      .findOne({ cardno: cardnox })
      .populate({
        path: 'user',
        populate: {
          path: 'accounts',
        },
      })
      .exec();
  }

  async getListCards(userid): Promise<any> {
    if (isEmpty(userid)) throw new FillFieldsException();
    return await this.getList(userid);
  }

  async insertCard(cardmanagementDto: CardmanagementcoreDto): Promise<any> {
    if (
      isEmpty(cardmanagementDto.cardno) ||
      isEmpty(cardmanagementDto.cardowner) ||
      isEmpty(cardmanagementDto.cardownerfullname) ||
      isEmpty(cardmanagementDto.organ) ||
      isEmpty(cardmanagementDto.user)
    )
      throw new FillFieldsException();
    if (isEmpty(cardmanagementDto.cardrelatione)) cardmanagementDto.cardrelatione = 'خودم';
    return await this.create(cardmanagementDto);
  }

  async insertCardWithNewRegister(userid, cardno, fullname): Promise<any> {
    const insertData = {
      cardno: cardno,
      cardowner: true,
      cardrelatione: 'خودم',
      cardownerfullname: fullname,
      user: userid,
    };
    return this.cardManagementModel.create(insertData);
  }

  async updateCard(cardmanagementDto: CardmanagementcoreDto): Promise<any> {
    if (
      isEmpty(cardmanagementDto.cardno) ||
      isEmpty(cardmanagementDto.cardowner) ||
      isEmpty(cardmanagementDto.cardownerfullname) ||
      isEmpty(cardmanagementDto.cardrelatione) ||
      isEmpty(cardmanagementDto.organ) ||
      isEmpty(cardmanagementDto.user)
    )
      throw new FillFieldsException();
    this.update(cardmanagementDto)
      .then((card) => {
        return AuthService.successOpt();
      })
      .catch((error) => {
        throw new UserCustomException('شماره کارت تکراری می باشد');
      });
  }

  async deleteCard(cardno: number): Promise<any> {
    if (isEmpty(cardno)) throw new FillFieldsException();
    const shetabCard = await this.delete(cardno);
    if (!shetabCard) throw new InternalServerErrorException();
    return AuthService.successOpt();
  }

  async checkCard(cardno: number): Promise<any> {
    if (isEmpty(cardno)) throw new FillFieldsException();
    const card = await this.findCard(cardno);
    if (!card) return false;
    return true;
  }

  async chanegCard(oldcard, newcard): Promise<any> {
    return this.cardManagementModel.findOneAndUpdate(
      {
        cardno: oldcard,
      },
      {
        cardno: newcard,
      }
    );
  }

  async getCardInfo(cardno: number): Promise<any> {
    if (isEmpty(cardno)) throw new FillFieldsException();
    return await this.findCard(cardno);
  }

  async remove(cardno: number): Promise<any> {
    return this.cardManagementModel.findOneAndRemove({
      cardno: cardno,
    });
  }
}
