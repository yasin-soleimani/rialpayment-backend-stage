import { Injectable } from '@vision/common';
import { DispatcherCoreService } from '../../Core/dispatcher/dispatcher.service';
import { DispatcherBackofficeUserDto } from './dto/dispatcher-backoffice-user.dto';
import { DispatcherBackofficeCardDto } from './dto/dispatcher-backoffice-card.dto';
import { DispatcherBackofficeMerchantDto } from './dto/dispatcher-backoffice-merchant.dto';

@Injectable()
export class DispatcherBackofficeService {
  constructor(private readonly dispatcherService: DispatcherCoreService) {}

  async addnewUser(getInfo: DispatcherBackofficeUserDto): Promise<any> {
    return await this.dispatcherService.addNewUser(getInfo);
  }

  // card Opt
  async addnewCard(getInfo: DispatcherBackofficeCardDto): Promise<any> {
    return await this.dispatcherService.addNewCard(getInfo);
  }

  //Merchant Opt
  async addnewMerchant(getInfo: DispatcherBackofficeMerchantDto): Promise<any> {
    return await this.dispatcherService.addNewMerchant(getInfo);
  }
}
