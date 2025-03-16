import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  successOpt,
  successOptWithDataNoValidation,
} from '@vision/common';
import { MerchantPspCustomerDto } from '../../Core/merchant-psp/dto/customer.dto';
import { MerchantPspRequestDto } from '../../Core/merchant-psp/dto/request.dto';
import { MerchantPspCoreCommonService } from '../../Core/merchant-psp/services/common.service';
import { MerchantPspCoreSubmitService } from '../../Core/merchant-psp/services/submit.service';
import { UserService } from '../../Core/useraccount/user/user.service';
import documentTypesValue from '../../Core/merchant-psp/const/document-types-value';
import { DocumentTypesEnum } from '../../Core/merchant-psp/enums/document-types-enum';
import mongoose from 'mongoose';

@Injectable()
export class BackofficeMerchantPspService {
  constructor(
    private readonly submitService: MerchantPspCoreSubmitService,
    private readonly commonService: MerchantPspCoreCommonService,
    private readonly usersService: UserService,
    @Inject('MerchantPspCustomerModel') private readonly CustomerModel: any
  ) {}

  async submitPos(getInfo: MerchantPspRequestDto): Promise<any> {
    const merchant = getInfo.mainCustomerId;
    const findMerchant = await this.CustomerModel.findOne({ savedId: merchant });
    if (!findMerchant) {
      throw new NotFoundException('مشتری با این شناسه یافت نشد');
    }
    getInfo.merchant = findMerchant._id;
    const data = await this.submitService.submitReqgister(getInfo);
    if (!data) throw new InternalServerErrorException();

    return successOpt();
  }

  async subCustomer(getInfo: MerchantPspCustomerDto): Promise<any> {
    const data = await this.submitService.submitCustomer(getInfo);
    if (!data) throw new InternalServerErrorException();

    return successOptWithDataNoValidation(data.savedId);
  }

  async uploadDocument(userId: string, customerId, type: number, req, documentType: DocumentTypesEnum): Promise<any> {
    if (!userId || !customerId || !type || typeof type !== 'number' || req.files === null || !req.files.file)
      throw new BadRequestException('تمامی فیلد ها را کامل کنید');
    if (!documentTypesValue[type]) throw new BadRequestException('نوع ارسال شده صحیح نمیباشد');
    const user = await this.usersService.findUser(userId);
    if (!mongoose.isValidObjectId(customerId)) throw new BadRequestException('کد مشتری صحیح نمیباشد');
    const customer = await this.CustomerModel.findOne({ _id: customerId });
    if (!customer) throw new BadRequestException('مشتری با این شناسه وجود ندارد');
    if (!user) throw new NotFoundException('کاربری یافت نشد');
    const data = await this.submitService.uploadDocument(userId, customerId, type, documentType, req);
    if (!data) throw new InternalServerErrorException();
    return data;
  }

  async listPos(userId: string, page, limit): Promise<any> {
    const data = await this.commonService.getRequestList(userId, null, page, limit);
    return successOptWithDataNoValidation(data);
  }

  async listCustomer(userId, page, limit): Promise<any> {
    const data = await this.commonService.getCustomerList(userId, page, limit);
    return successOptWithDataNoValidation(data);
  }

  async listFiles(userId: string, documentType: DocumentTypesEnum, customerId = null): Promise<any> {
    const data = await this.commonService.getFileListByUserId(userId, customerId, documentType);
    return successOptWithDataNoValidation(data);
  }

  async listCountries(getInfo): Promise<any> {
    const data = await this.submitService.getCountryList(getInfo);
    if (!data) throw new InternalServerErrorException();
    return data;
  }
  async listCities(getInfo): Promise<any> {
    const data = await this.submitService.getCityList(getInfo);
    if (!data) throw new InternalServerErrorException();
    return data;
  }
  async getGuildList(getInfo): Promise<any> {
    const data = await this.submitService.getGuildList(getInfo);
    if (!data) throw new InternalServerErrorException();
    return data;
  }
  async getPosTypes(getInfo): Promise<any> {
    const data = await this.submitService.getPosTypes(getInfo);
    if (!data) throw new InternalServerErrorException();
    return data;
  }
  async getPosModelList(getInfo): Promise<any> {
    const data = await this.submitService.getPosModelList(getInfo);
    if (!data) throw new InternalServerErrorException();
    return data;
  }

  async listBanks(getInfo): Promise<any> {
    const data = await this.submitService.getBanksList(getInfo);
    if (!data) throw new InternalServerErrorException();
    return data;
  }
  async listBranches(getInfo): Promise<any> {
    const data = await this.submitService.getBranchesList(getInfo);
    if (!data) throw new InternalServerErrorException();
    return data;
  }
}
