import { Inject, Injectable } from '@vision/common';
import { Model } from 'mongoose';
import { AddressDto } from '../../../../Api/basket/vitrin/dto/address.dto';

@Injectable()
export class BasketAddressCoreService {
  constructor(@Inject('BasketAddressModel') private readonly addressModel: Model<any>) {}

  async addNew(
    province: string,
    city: string,
    address: string,
    postalcode: string,
    fullname: string,
    mobile: number,
    userid: string,
    location: {
      type: 'Point';
      coordinates: number[];
    }
  ): Promise<any> {
    return this.addressModel.create({
      province: province,
      city: city,
      address: address,
      postalcode: postalcode,
      fullname: fullname,
      mobile: mobile,
      user: userid,
      location,
    });
  }

  async update(addressId: string, getInfo: Partial<AddressDto>): Promise<any> {
    return this.addressModel.findOneAndUpdate({ _id: addressId }, getInfo, { new: true });
  }

  async delete(addressId: string): Promise<any> {
    return this.addressModel.findOneAndUpdate({ _id: addressId }, { deleted: true }, { new: true });
  }

  async getAdrress(userid: string): Promise<any> {
    return this.addressModel.find({
      user: userid,
      deleted: false,
    });
  }

  async getAddressById(addressId: string): Promise<any> {
    return this.addressModel.findOne({ _id: addressId });
  }
}
