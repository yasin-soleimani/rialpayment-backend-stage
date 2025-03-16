import { Model } from 'mongoose';
import { Injectable, Inject } from '@vision/common';
import { DispatcherCoreDto } from './dto/dispatcher-user.dto';
import { DispatcherMerchantCoreDto } from './dto/dispatcher-merchant.dto';
import { DispatcherCardCoreDto } from './dto/dispatcher-card.dto';
import { DispatcherBinCoreDto } from './dto/dispatcher-bin.dto';

@Injectable()
export class DispatcherCoreService {
  constructor(
    @Inject('DispatcheruserModel') private readonly dispatcherUserModel: Model<any>,
    @Inject('DispatchermerchantModel') private readonly dispatcherMerchantModel: Model<any>,
    @Inject('DispatchercardsModel') private readonly dispatcherCardsModel: Model<any>,
    @Inject('DispatcherbinModel') private readonly dispatcherBinModel: Model<any>
  ) {}

  // Dispather User Management
  async addNewUser(getInfo: DispatcherCoreDto): Promise<any> {
    return this.dispatcherUserModel.create(getInfo);
  }

  async editUser(getInfo: DispatcherCoreDto, userid): Promise<any> {
    return this.dispatcherUserModel.findOneAndUpdate({ _id: userid }, getInfo);
  }

  async changeStatusUser(userid, status): Promise<any> {
    return this.dispatcherUserModel.findOneAndUpdate({ _id: userid }, { status: status });
  }

  // Dispatcher Merchant Management
  async addNewMerchant(getInfo: DispatcherMerchantCoreDto): Promise<any> {
    return this.dispatcherMerchantModel.create(getInfo);
  }

  async editMerchant(getInfo: DispatcherMerchantCoreDto, merchantid): Promise<any> {
    return this.dispatcherMerchantModel.findOneAndUpdate({ _id: merchantid }, getInfo);
  }

  async changeStatusMerchant(merchantid, status): Promise<any> {
    return this.dispatcherMerchantModel.findOneAndUpdate({ _id: merchantid }, { status: status });
  }

  async getMerchantInfo(merchantcode): Promise<any> {
    return this.dispatcherMerchantModel.findOne({ merchantcode: merchantcode }).populate('dispatcheruser');
  }

  // Dispatcher Card Management
  async addNewCard(getInfo: DispatcherCardCoreDto): Promise<any> {
    return this.dispatcherCardsModel.create(getInfo);
  }

  async editCard(getInfo: DispatcherCardCoreDto, cardid): Promise<any> {
    return this.dispatcherCardsModel.findOneAndUpdate({ _id: cardid }, getInfo);
  }

  async changeStatusCard(cardid, status): Promise<any> {
    return this.dispatcherCardsModel.findOneAndUpdate({ _id: cardid }, { status: status });
  }

  // Dispatcher Bin Management
  async addNewBin(getInfo: DispatcherBinCoreDto): Promise<any> {
    return this.dispatcherBinModel.create(getInfo);
  }

  async editBin(getInfo: DispatcherBinCoreDto, binid): Promise<any> {
    return this.dispatcherBinModel.findOneAndUpdate({ _id: binid }, getInfo);
  }

  async disableBin(binid, status): Promise<any> {
    return this.dispatcherBinModel.findOneAndUpdate({ _id: binid }, { status: status });
  }
}
