import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  successOpt,
  successOptWithDataNoValidation,
} from '@vision/common';
import { MerchantPspRequestDto } from '../../Core/merchant-psp/dto/request.dto';
import { MerchantPspCoreCommonService } from '../../Core/merchant-psp/services/common.service';
import { MerchantPspCoreSubmitService } from '../../Core/merchant-psp/services/submit.service';
import { BackofficeMerchantPspService } from '../../Backoffice/merchant-psp/merchant-psp.service';
import { UserService } from '../../Core/useraccount/user/user.service';
import { MerchantPspCustomerDto } from '../../Core/merchant-psp/dto/customer.dto';
import documentTypesValue from '../../Core/merchant-psp/const/document-types-value';
import { DocumentTypesEnum } from '../../Core/merchant-psp/enums/document-types-enum';
import { GetRequestDetailByFollowupCodeDto } from '../../Core/merchant-psp/dto/getRequestDetailByFollowupCode.dto';
import * as mongoose from 'mongoose';
import { PnaGetRequestByFollowupCode } from '../../Core/merchant-psp/api/novin-arian.api';

@Injectable()
export class MerchantPspApiService {
  constructor(
    private readonly submitService: MerchantPspCoreSubmitService,
    private readonly commonService: MerchantPspCoreCommonService,
    private readonly usersService: UserService,
    @Inject('MerchantPspCustomerModel') private readonly CustomerModel: any,
    @Inject('MerchantPspRequestModel') private readonly RequestModel: any
  ) {}

  async submitPos(getInfo: MerchantPspRequestDto): Promise<any> {
    const data = await this.submitService.submitReqgister(getInfo);
    if (!data) throw new InternalServerErrorException();
    return successOptWithDataNoValidation(data);
  }
  async BindPosSerialToTerminal(getInfo: MerchantPspRequestDto): Promise<any> {
    if (!getInfo.productSerials || !getInfo.merchant || !getInfo.requestId)
      throw new BadRequestException('لطفا تمامی فیلد ها را پر کنید');
    if (!mongoose.isValidObjectId(getInfo.merchant)) throw new BadRequestException('کد مشتری صحیح نمیباشد');
    if (!mongoose.isValidObjectId(getInfo.requestId)) throw new BadRequestException('کد درخواست ترمینال صحیح نمیباشد');
    const customer = await this.RequestModel.findOne({ merchant: getInfo.merchant, _id: getInfo.requestId });
    if (!customer) throw new BadRequestException('برای این مشتری با این شناسه، درخواست ترمینال ثبت نشده است');
    const getfollowupcode = await PnaGetRequestByFollowupCode({
      FollowupCode: customer.followUpCode,
    });
    console.log('terminal:::::', getfollowupcode.Data.TerminalID);
    if (
      getfollowupcode.Data.hasOwnProperty('TerminalID') &&
      getfollowupcode.Data.TerminalID !== null &&
      getfollowupcode.Data.TerminalID !== undefined
    ) {
      getInfo.terminalId = getfollowupcode.Data.TerminalID;
      getInfo.posType = customer.posType;
      getInfo.posModel = customer.posModel;
    } else {
      throw new BadRequestException('برای این مشتری با این شناسه درخواست هنوز شناسه ترمینالی تخصیص داده نشده است');
    }
    const data = await this.submitService.BindPosSerialToTerminal(getInfo);
    if (!data) throw new InternalServerErrorException();
    return successOptWithDataNoValidation(data);
  }
  async BoundPoses(getInfo: MerchantPspRequestDto, page, limit): Promise<any> {
    if (!getInfo.merchant) throw new BadRequestException('لطفا تمامی فیلد ها را پر کنید');
    if (!mongoose.isValidObjectId(getInfo.merchant)) throw new BadRequestException('کد مشتری صحیح نمیباشد');
    const customer = await this.commonService.getBoundPosList(getInfo.user, getInfo.merchant, page, limit);
    return successOptWithDataNoValidation(customer);
  }
  async updatePos(getInfo: MerchantPspRequestDto): Promise<any> {
    const data = await this.submitService.updateRegister(getInfo);
    console.log(data);
    if (!data) throw new InternalServerErrorException();
    return successOptWithDataNoValidation(data);
  }
  async updateRequestDocument(getInfo: MerchantPspRequestDto): Promise<any> {
    const data = await this.submitService.updateRequestDocument(getInfo);
    console.log(data);
    if (!data) throw new InternalServerErrorException();
    return successOpt();
  }

  async getRequestByFollowUpCode(getInfo: GetRequestDetailByFollowupCodeDto): Promise<any> {
    const data = await this.submitService.getRequestByFollowUpCode(getInfo);
    if (!data) throw new InternalServerErrorException();
    return successOptWithDataNoValidation(data);
  }

  async GetRequestListlByCustomerCode(getInfo: GetRequestDetailByFollowupCodeDto): Promise<any> {
    const data = await this.submitService.GetRequestListlByCustomerCode(getInfo);
    if (!data) throw new InternalServerErrorException();
    return successOptWithDataNoValidation(data);
  }
  async GetRequestListlByProductSerial(getInfo: GetRequestDetailByFollowupCodeDto): Promise<any> {
    const data = await this.submitService.GetRequestListlByProductSerial(getInfo);
    if (!data) throw new InternalServerErrorException();
    return successOptWithDataNoValidation(data);
  }

  async subCustomer(getInfo: MerchantPspCustomerDto): Promise<any> {
    const data = await this.submitService.submitCustomer(getInfo);
    if (!data) throw new InternalServerErrorException();
    return successOptWithDataNoValidation(data);
  }
  async updateCustomer(getInfo: MerchantPspCustomerDto): Promise<any> {
    const data = await this.submitService.updateCustomer(getInfo);
    if (!data) throw new InternalServerErrorException();

    return successOptWithDataNoValidation(data);
  }

  async getCustomerData(getInfo): Promise<any> {
    const user = await this.usersService.findUser(getInfo.user);
    getInfo.national = user.nationalcode;
    const data = await this.submitService.getCustomerDataByNationalCode(getInfo);
    if (!data) throw new InternalServerErrorException();

    return data;
  } // getCustomerData

  async uploadDocument(userId: string, customerId, type: number, req, documentType: DocumentTypesEnum): Promise<any> {
    console.log(req.files);
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

  async listPos(userId: string, customerId, page, limit): Promise<any> {
    const data = await this.commonService.getRequestList(userId, customerId, page, limit);
    return successOptWithDataNoValidation(data);
  }

  async listCustomer(userId, page, limit): Promise<any> {
    const data = await this.commonService.getCustomerList(userId, page, limit);
    return successOptWithDataNoValidation(data);
  }

  async listFiles(userId: string, documentType: DocumentTypesEnum = 0, customerId = null, type = 0): Promise<any> {
    if (customerId !== null) {
      if (!mongoose.isValidObjectId(customerId)) throw new BadRequestException('کد مشتری صحیح نمیباشد');
      const customer = await this.CustomerModel.findOne({ _id: customerId });
      if (!customer) throw new BadRequestException('مشتری با این شناسه وجود ندارد');
    }
    const data = await this.commonService.getFileListByUserId(userId, customerId, documentType, type);
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

  /*  async submitRequest(getInfo: MerchantPspRequestDto): Promise<any> {
    const data = await this.submitService.submitReqgister(getInfo);
    if (!data) throw new InternalServerErrorException();

    return successOpt();
  }

  async getDocList(userId: string): Promise<any> {
    const data = await this.commonService.getFileListByUserId(userId);
    return successOptWithDataNoValidation(data);
  }

  async getReqList(userId: string): Promise<any> {
    const data = await this.commonService.getRequestInfoById(userId);
    return successOptWithDataNoValidation(data);
  }

  async getCustomer(userId: string): Promise<any> {
    const data = await this.commonService.getCustomerList(userId);
    return successOptWithDataNoValidation(data);
  }*/
}
