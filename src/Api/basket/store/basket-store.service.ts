import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  successOpt,
  successOptWithDataNoValidation,
} from '@vision/common';
import { BasketStoreCoreService } from '../../../Core/basket/store/basket-store.service';
import { BasketStoreApiDto } from './dto/basket-store.dto';
import * as uniqid from 'uniqid';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { MipgCoreService } from '../../../Core/mipg/mipg.service';
import { isEmpty, isNil } from '@vision/common/utils/shared.utils';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { BasketStoreInfo } from './model/store-info.model';
import { UpdateStoreTransmissionSettingsDto } from './dto/update-store-transmission-settings.dto';
import { Request } from 'express';
import { BasketDeliveryTimeDto, UpdateDeliveryTimeDto } from '../../../Core/basket/delivery-time/dto/delivery-time.dto';
import { DeliveryTimeService } from '../../../Core/basket/delivery-time/delivery-time.service';
import { imageTransform } from '@vision/common/transform/image.transform';
import { UPLOAD_URI } from '../../../__dir__';

@Injectable()
export class BasketStoreApiService {
  constructor(
    private readonly storeCoreService: BasketStoreCoreService,
    private readonly basketDeliveryTimeCoreService: DeliveryTimeService,
    private readonly mipgService: MipgCoreService
  ) {}

  async addNew(getInfo: BasketStoreApiDto, userid: string, req): Promise<any> {
    getInfo.user = userid;
    getInfo.hasOwnShop = getInfo?.hasOwnShop === 'false' ? false : true;
    getInfo.hasIranianShop = getInfo?.hasIranianShop === 'false' ? false : true;
    getInfo.isHyper = getInfo?.isHyper === 'true' ? true : false;

    // check uploaded file
    this.checkFile(req);

    if (getInfo?.hasIranianShop && getInfo?.hasOwnShop) {
      // user wants both iranian shop and his/her own shop
      // check shopTitle and shopUrl
      if (!getInfo.ownShopTitle || !getInfo.ownShopUrl || !getInfo.ownShopAbout) throw new FillFieldsException();
      // check required iranianShop data
      getInfo = await this.checkRequiredIranianShopFields(getInfo, req);
    } else if (getInfo?.hasIranianShop && !getInfo?.hasOwnShop) {
      // user only wants iranian shop
      getInfo = await this.checkRequiredIranianShopFields(getInfo, req);
    } else if (!getInfo?.hasIranianShop && getInfo?.hasOwnShop) {
      // user only wants his/her own shop
      // check shopTitle and shopUrl
      if (!getInfo.ownShopTitle || !getInfo.ownShopUrl || !getInfo.ownShopAbout) throw new FillFieldsException();
      getInfo.tels = [];
    } else {
      // both of them are false, so throw internal server error exception
      throw new InternalServerErrorException('حداقل یکی از موارد را انتخاب کنید');
    }
    // @ts-ignore
    getInfo.mobiles = JSON.parse(getInfo.mobiles);
    // actually add new document to collection
    const data = await this.storeCoreService.addNew(getInfo);

    // if any error occured throw an exception
    if (!data) throw new InternalServerErrorException();

    // task successfully done!
    return successOpt();
  }

  async getData(userid: string): Promise<any> {
    const data = await this.storeCoreService.getInfo(userid);
    if (!data) return successOptWithDataNoValidation(null);
    data.logo = imageTransform(data.logo);
    const bannerArrays = [];
    for (const banner of data.banners) {
      if (!!banner.img) bannerArrays.push({ _id: banner._id, img: imageTransform(banner.img) });
    }
    data.banners = bannerArrays;
    return successOptWithDataNoValidation(BasketStoreInfo(data));
  }

  async getNickname(userid: string): Promise<any> {
    const data = await this.storeCoreService.getInfo(userid);
    if (!data) throw new UserCustomException('فروشگاه ثبت نشده است', false, 404);
    return successOptWithDataNoValidation(data.nickname);
  }

  async checkNickname(nickname: string): Promise<any> {
    if (isEmpty(nickname)) throw new FillFieldsException();
    nickname = nickname.toLocaleLowerCase();
    const data = await this.storeCoreService.checkNickname(nickname);
    if (!data) return successOptWithDataNoValidation(false);
    return successOptWithDataNoValidation(true);
  }

  async setIpg(userid: string, terminalid: number): Promise<any> {
    if (isEmpty(terminalid)) throw new FillFieldsException();
    const mipgInfo = await this.mipgService.getInfo(terminalid);
    if (!mipgInfo) throw new UserCustomException('ترمینال یافت نشد', false, 500);
    if (mipgInfo.user._id != userid) throw new UserCustomException('شما به این ترمینال دسترسی ندارید');
    const storeInfo = await this.storeCoreService.getInfo(userid);
    if (!storeInfo) throw new UserCustomException('فروشگاه یافت نشد');
    if (storeInfo.status == false) throw new UserCustomException('فروشگاه غیرفعال می باشد');
    console.log(mipgInfo, 'id mipg');
    return this.storeCoreService
      .setIpg(userid, mipgInfo._id)
      .then((res) => {
        return successOpt();
      })
      .catch((err) => {
        throw new InternalServerErrorException();
      });
  }

  async changeStatus(userid: string, status): Promise<any> {
    let statusx = false;
    if (status == 'true') statusx = true;

    const data = await this.storeCoreService.changeStatus(userid, statusx);
    if (!data) throw new InternalServerErrorException();
    return successOpt();
  }

  async update(getInfo: BasketStoreApiDto, userid: string, req): Promise<any> {
    getInfo.user = userid;
    if (!req.files) {
      delete getInfo.logo;
      delete getInfo.banner;
      delete getInfo.banners;
    } else {
      if (req.files.logo) {
        this.checkFile(req);
        const logo = await this.upload(req);
        getInfo.logo = logo;
      } else {
        delete getInfo.logo;
      }
      delete getInfo.banner;
    }

    for (const key in getInfo) {
      if (Object.prototype.hasOwnProperty.call(getInfo, key)) {
        const element = getInfo[key];
        if (element === undefined || element === 'undefined' || element === null) {
          delete getInfo[key];
        }
      }
    }
    const mobiles = [];
    console.log('getinfo before:::::::::', getInfo);
    try {
      getInfo.mobiles = JSON.parse(getInfo.mobiles + '');
    } catch (e) {}
    if (getInfo.mobiles.length > 0) {
      for (const i of getInfo.mobiles) {
        let mob = parseInt(i + '');
        console.log('iiiiii:::::', i);
        console.log(!isNaN(mob), (mob + '').length === 10);
        if (!isNaN(mob) && (mob + '').length === 10) mobiles.push(mob);
      }
    }
    getInfo.mobiles = [...mobiles];
    console.log('getinfo after:::::::::', getInfo);
    if (getInfo.isHyper) getInfo.isHyper = getInfo.isHyper === 'true';
    getInfo.tels = JSON.parse(getInfo.tels as string) as string[];
    const data = await this.storeCoreService.update(getInfo);
    if (!data) throw new InternalServerErrorException();

    return successOpt();
  }

  async uploadBanners(req, userid) {
    if (!!req.files && !!req.files.banners) {
      if (Array.isArray(req.files.banners)) throw new FillFieldsException();
      const banner = await this.uploadBanner(req);
      if (banner) {
        const updatedBanner = await this.storeCoreService.pushBanner({ user: userid, banners: banner });
        if (updatedBanner) {
          const banners = { ...updatedBanner };
          const bannersArray = [];
          for (const ban of banners.banners) {
            bannersArray.push({ ...ban, img: imageTransform(ban.img) });
          }
          banners.banners = bannersArray;
          return successOptWithDataNoValidation(banners);
        } else throw new NotFoundException('موردی یافت نشد');
      } else throw new FillFieldsException('فایل های ارسالی مورد تایید نمیباشند');
    } else throw new FillFieldsException();
  }

  async deleteBanner(userid: string, bannerId: string) {
    if (!!bannerId) {
      const updatedBanner = await this.storeCoreService.removeBanner(userid, bannerId);
      if (!updatedBanner) throw new NotFoundException('بنر یافت نشد');
      return successOptWithDataNoValidation(updatedBanner);
    } else throw new FillFieldsException();
  }

  async updateTransmissionSettings(
    getInfo: UpdateStoreTransmissionSettingsDto,
    userid: string,
    req: Request
  ): Promise<any> {
    getInfo.user = userid;
    if (isNil(getInfo)) throw new FillFieldsException();
    if (isNil(getInfo.hasDeliveryToWholeCountry)) throw new FillFieldsException();
    if (isNil(getInfo.deliveryProvince)) throw new FillFieldsException();
    if (isNil(getInfo.deliveryCity)) throw new FillFieldsException();
    if (isNil(getInfo?.hasDelivery) || isNil(getInfo?.hasPishtaz)) throw new FillFieldsException();
    if (getInfo?.hasDelivery && !getInfo?.deliveryPrice) throw new FillFieldsException();
    if (getInfo?.hasDelivery && !getInfo?.deliveryDescription) throw new FillFieldsException();
    if (getInfo?.hasDelivery && isNil(getInfo?.deliveryTimeout)) throw new FillFieldsException('');
    if (getInfo?.hasPishtaz && !getInfo?.pishtazPrice) throw new FillFieldsException();
    if (getInfo?.hasPishtaz && !getInfo?.pishtazDescription) throw new FillFieldsException();
    if (getInfo?.hasFreeShipping && !getInfo?.freeShippingAmount) throw new FillFieldsException();

    const data = await this.storeCoreService.updateTransmissionSettings(getInfo);
    if (!data) throw new InternalServerErrorException();

    return successOpt();
  }

  private async upload(req): Promise<any> {
    const mime = this.checkMime(req.files.logo.mimetype);
    const avatar = req.files.logo;
    // const img =  userid + '.' +  mime;
    const uuid = uniqid();
    const img = uuid + '.' + mime;
    await avatar.mv(UPLOAD_URI + img, (err) => {
      if (err) throw new InternalServerErrorException();
    });
    return img;
  }

  private async uploadBanner(req): Promise<any> {
    const mime = this.checkMime(req.files.banners.mimetype);
    const banner = req.files.banners;

    // const img =  userid + '.' +  mime;
    const uuid = uniqid();
    const img = uuid + '.' + mime;
    await banner.mv(UPLOAD_URI + img, (err) => {
      if (err) throw new InternalServerErrorException();
    });

    return img;
  }

  checkFile(req) {
    if (!req.files.logo) throw new FillFieldsException();
  }
  checkMime(mimetype: string) {
    switch (mimetype) {
      case 'image/png': {
        return 'png';
      }
      case 'image/jpg': {
        return 'jpg';
      }
      case 'image/jpeg': {
        return 'jpeg';
      }
    }
  }

  private async checkRequiredIranianShopFields(getInfo: BasketStoreApiDto, req: Request): Promise<BasketStoreApiDto> {
    // validate nickname
    getInfo.nickname = getInfo.nickname.toLocaleLowerCase();
    const regex = new RegExp('^[a-zA-Z0-9]+$');
    const regData = getInfo.nickname.match(regex);
    if (!regData) throw new UserCustomException('آی دی نامعتبر');
    const findWithNickname = await this.storeCoreService.getInfoByNickname(getInfo.nickname);
    if (findWithNickname) throw new BadRequestException('این ای دی قبلا استفاده شده است');

    // upload logo
    const logo = await this.upload(req);
    getInfo.logo = logo;

    // upload banner if exists
    delete getInfo.banner;
    delete getInfo.banners;

    // set telephone numbers
    getInfo.tels = JSON.parse(getInfo.tels as string) as string[];

    return getInfo;
  }

  async getBasketDeliveryTime(basketStoreId: string): Promise<any> {
    const store = await this.storeCoreService.getInfoById(basketStoreId);
    if (!store) {
      throw new NotFoundException('فروشگاه یافت نشد');
    }
    const data = await this.basketDeliveryTimeCoreService.getByBasketStoreId(store);
    return successOptWithDataNoValidation(data);
  }

  async addDeliveryTime(basketStoreId: string, dto: BasketDeliveryTimeDto): Promise<any> {
    if (isNil(dto.capacity) || isNil(dto.day) || isNil(dto.startTime) || isNil(dto.endTime)) {
      throw new FillFieldsException();
    }

    const data = await this.basketDeliveryTimeCoreService.create(basketStoreId, dto);
    return successOptWithDataNoValidation(data);
  }

  async updateDeliveryTime(basketStoreId: string, deliveryRangeId: string, dto: UpdateDeliveryTimeDto): Promise<any> {
    if (Object.prototype.hasOwnProperty.call(dto, 'capacity')) {
      if (isNil(dto.capacity)) {
        throw new FillFieldsException();
      }
    }

    if (Object.prototype.hasOwnProperty.call(dto, 'status')) {
      if (isNil(dto.status)) {
        throw new FillFieldsException();
      }
    }

    const data = await this.basketDeliveryTimeCoreService.update(basketStoreId, deliveryRangeId, dto);
    return successOptWithDataNoValidation(data);
  }
}
