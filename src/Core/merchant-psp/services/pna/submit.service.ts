import {
  Injectable,
  Inject,
  InternalServerErrorException,
  successOptWithDataNoValidation,
  successOpt,
} from '@vision/common';
import {
  PnaAddNewCustomer,
  PnaAddNewRequest,
  PnaAddUpdateRequest,
  PnaBindPosSerialToTerminal,
  PnaGetBanksList,
  PnaGetBranchList,
  PnaGetCityList,
  PnaGetCountryList,
  PnaGetCustomer,
  PnaGetGuildsList,
  PnaGetPosModelList,
  PnaGetPosTypes,
  PnaGetRequestByFollowupCode,
  PnaGetRequestListlByCustomerCode,
  PnaGetRequestListlByProductSerial,
  PnaUpdateCustomer,
  PnaUpdateRequestDocument,
  PnaUploadDocument,
} from '../../api/novin-arian.api';
import { MerchantPspCustomerDto } from '../../dto/customer.dto';
import { MerchantPspRequestDto } from '../../dto/request.dto';
import { MerchantPspPnaCustomerModel } from '../../model/pna-customer.dto';
import {
  generateMerchantDocument,
  MerchantPspPnaRequestModel,
  MerchantPspPnaUpdateRequestModel,
} from '../../model/pna-request.dto';
import { GetRequestDetailByFollowupCodeDto } from '../../dto/getRequestDetailByFollowupCode.dto';

// this module need to test in test sandbox
@Injectable()
export class MerchantPspCorePnaSubmitService {
  constructor(
    @Inject('MerchantPspRequestModel') private readonly RequestModel: any,
    @Inject('MerchantPspCustomerModel') private readonly CustomerModel: any,
    @Inject('MerchantPspPosModel') private readonly PosModel: any
  ) {}

  async submitRequest(getInfo: MerchantPspRequestDto): Promise<any> {
    const requestModel = await MerchantPspPnaRequestModel(getInfo);
    if (requestModel.RequestMerchantDocument.Data.length < 1) delete requestModel.RequestMerchantDocument;
    console.log(requestModel);
    let err = '';
    try {
      const AddNewRequestResult = await PnaAddNewRequest(requestModel);
      console.log(AddNewRequestResult);
      if (AddNewRequestResult.SavedID !== null) {
        getInfo.followUpCode = AddNewRequestResult.Data.FollowupCode;
        getInfo.savedId = AddNewRequestResult.SavedID;
        getInfo.res = [JSON.stringify(AddNewRequestResult)];
        return this.RequestModel.create(getInfo);
      } else {
        err = AddNewRequestResult.ErrorMessage;
      }
    } catch (e) {
      console.log(e);
    }
    if (!!err) {
      throw new InternalServerErrorException(err);
    }
  }

  async BindPosSerialToTerminal(getInfo: MerchantPspRequestDto): Promise<any> {
    let err = '';
    try {
      const bindSerialToTerminal = await PnaBindPosSerialToTerminal(getInfo);
      console.log(bindSerialToTerminal);
      if (bindSerialToTerminal.SavedID !== null) {
        const posbind = await this.PosModel.create({
          posModel: getInfo.posModel,
          posSerialNumber: getInfo.productSerials,
          posType: getInfo.posType,
          isBind: true,
          bindTerminalId: getInfo.terminalId,
          merchant: getInfo.merchant,
          user: getInfo.user,
          savedId: bindSerialToTerminal.SavedID,
          res: [JSON.stringify(bindSerialToTerminal)],
        });
        console.log('posBind:::::::::::::', posbind);
        const updatedReqesut = await this.RequestModel.findOneAndUpdate(
          { merchant: getInfo.merchant, _id: getInfo.requestId },
          { boundId: posbind._id, terminalId: getInfo.terminalId },
          { new: true }
        );
        console.log('updatedReqesut:::::::::::::::', updatedReqesut);
        return posbind;
      } else {
        err = bindSerialToTerminal.ErrorMessage;
      }
    } catch (e) {
      console.log(e);
    }
    if (!!err) {
      throw new InternalServerErrorException(err);
    }
  }

  // update request
  async updateRequest(getInfo: MerchantPspRequestDto): Promise<any> {
    const requestModel = await MerchantPspPnaUpdateRequestModel(getInfo);

    if (requestModel.RequestMerchantDocument.Data.length < 1) delete requestModel.RequestMerchantDocument;
    console.log(requestModel);
    let err = '';
    try {
      const updateRequestResult = await PnaAddUpdateRequest(requestModel);
      console.log(updateRequestResult);
      if (updateRequestResult.Status === 1) {
        getInfo.savedId = updateRequestResult.SavedID;
        return this.RequestModel.findOneAndUpdate({ followUpCode: getInfo.followUpCode, user: getInfo.user }, getInfo, {
          new: true,
        });
      } else {
        err = updateRequestResult.ErrorMessage;
      }
    } catch (e) {
      console.log(e);
    }
    if (!!err) {
      throw new InternalServerErrorException(err);
    }
  }

  // update request Document
  async updateRequestDocument(getInfo: MerchantPspRequestDto): Promise<any> {
    console.log(getInfo);
    let err = '';
    try {
      const updateRequestResult = await PnaUpdateRequestDocument(getInfo);
      console.log(updateRequestResult);
      if (updateRequestResult.Status === 1) {
        return successOpt();
      } else {
        err = updateRequestResult.ErrorMessage;
      }
    } catch (e) {
      console.log(e);
    }
    if (!!err) {
      throw new InternalServerErrorException(err);
    }
  }

  async getRequestDetailByFollowupCode(getInfo: GetRequestDetailByFollowupCodeDto): Promise<any> {
    let err = '';
    try {
      const getRequestDetailResponse = await PnaGetRequestByFollowupCode({ FollowupCode: getInfo.followupCode });
      if (getRequestDetailResponse.Status === 1) {
        return { ...getRequestDetailResponse.Data, Childs: getRequestDetailResponse.Childs };
      } else {
        err = getRequestDetailResponse.ErrorMessage;
      }
    } catch (e) {
      console.log(e);
    }
    if (!!err) {
      throw new InternalServerErrorException(err);
    }
  }
  async GetRequestListlByCustomerCode(getInfo: GetRequestDetailByFollowupCodeDto): Promise<any> {
    let err = '';
    try {
      const getRequestDetailResponse = await PnaGetRequestListlByCustomerCode({ MainCustomer: getInfo.mainCustomer });
      console.log(getRequestDetailResponse);
      if (getRequestDetailResponse.Status === 1) {
        return { ...getRequestDetailResponse.Data, Childs: getRequestDetailResponse.Childs };
      } else {
        err = getRequestDetailResponse.ErrorMessage;
      }
    } catch (e) {
      console.log(e);
    }
    if (!!err) {
      throw new InternalServerErrorException(err);
    }
  }
  async GetRequestListlByProductSerial(getInfo: GetRequestDetailByFollowupCodeDto): Promise<any> {
    let err = '';
    try {
      const getRequestDetailResponse = await PnaGetRequestListlByProductSerial({
        ProductSerial: getInfo.productSerial,
      });
      console.log(getRequestDetailResponse);
      if (getRequestDetailResponse.Status === 1) {
        return { ...getRequestDetailResponse.Data, Childs: getRequestDetailResponse.Childs };
      } else {
        err = getRequestDetailResponse.ErrorMessage;
      }
    } catch (e) {
      console.log(e);
    }
    if (!!err) {
      throw new InternalServerErrorException(err);
    }
  }

  async getCustomerDataByNationalCode(getInfo): Promise<any> {
    console.log(getInfo);
    const { GetCustomerByCodeResult } = await PnaGetCustomer(getInfo.national);
    console.log(GetCustomerByCodeResult);
    const { attributes, Data } = GetCustomerByCodeResult;
    if (GetCustomerByCodeResult.Status == 'Successed') {
      return successOptWithDataNoValidation(GetCustomerByCodeResult);
    } else {
      throw new InternalServerErrorException();
    }
  }

  async getCountryList(getInfo): Promise<any> {
    console.log(getInfo);
    const { GetCountryListResult } = await PnaGetCountryList(getInfo.page, getInfo.limit);
    console.log(GetCountryListResult);
    const { attributes, Data } = GetCountryListResult;
    if (attributes.Status == 'Successed') {
      return successOptWithDataNoValidation(Data.GetCountryListEntity);
    } else {
      throw new InternalServerErrorException();
    }
  }

  async getCityList(getInfo): Promise<any> {
    console.log(getInfo);
    const { GetCityListResult } = await PnaGetCityList(getInfo.page, getInfo.limit);
    console.log(GetCityListResult);
    const { attributes, Data } = GetCityListResult;
    if (attributes.Status == 'Successed') {
      return successOptWithDataNoValidation(Data.CityListEntity);
    } else {
      throw new InternalServerErrorException();
    }
  }

  async getGuildsList(getInfo): Promise<any> {
    console.log(getInfo);
    const { GetGuildsResult } = await PnaGetGuildsList(getInfo.page, getInfo.limit);
    console.log(GetGuildsResult);
    const { attributes, Data } = GetGuildsResult;
    if (attributes.Status == 'Successed') {
      return successOptWithDataNoValidation(Data.GuildsListEntity);
    } else {
      throw new InternalServerErrorException();
    }
  }

  async getPosTypes(getInfo): Promise<any> {
    console.log(getInfo);
    const { GetPosTypeListResult } = await PnaGetPosTypes(getInfo.page, getInfo.limit);
    console.log(GetPosTypeListResult);
    const { attributes, Data } = GetPosTypeListResult;
    if (attributes.Status == 'Successed') {
      return successOptWithDataNoValidation(Data.PosTypeListsEntity);
    } else {
      throw new InternalServerErrorException();
    }
  }
  async getPosModelList(getInfo): Promise<any> {
    console.log(getInfo);
    const { GetPosModelListResult } = await PnaGetPosModelList(getInfo.page, getInfo.limit);
    console.log(GetPosModelListResult);
    const { attributes, Data } = GetPosModelListResult;
    if (attributes.Status == 'Successed') {
      return successOptWithDataNoValidation(Data.PosModelEntity);
    } else {
      throw new InternalServerErrorException();
    }
  }

  async getBanksList(getInfo): Promise<any> {
    console.log(getInfo);
    const { GetBanksResult } = await PnaGetBanksList(getInfo.page, getInfo.limit);
    console.log(GetBanksResult);
    const { attributes, Data } = GetBanksResult;
    if (attributes.Status == 'Successed') {
      console.log(Data.BankListsEntity.length);
      return successOptWithDataNoValidation(Data.BankListsEntity);
    } else {
      throw new InternalServerErrorException();
    }
  }

  async getBranchesList(getInfo): Promise<any> {
    console.log(getInfo);
    const { GetBranchListResult } = await PnaGetBranchList(getInfo.page, getInfo.limit, getInfo.bankId);
    console.log(GetBranchListResult);
    const { attributes, Data } = GetBranchListResult;
    if (attributes.Status == 'Successed') {
      return successOptWithDataNoValidation(Data.BranchListEntity);
    } else {
      throw new InternalServerErrorException();
    }
  }

  async getList(userId: string): Promise<any> {
    return this.CustomerModel.find({ user: userId });
  }
  async submitCustomer(getInfo: MerchantPspCustomerDto): Promise<any> {
    const newInfo = { ...getInfo };
    console.log('user::::::', newInfo.user);
    const customerModel = await MerchantPspPnaCustomerModel(getInfo);
    for (const item in customerModel) {
      if (customerModel[item] === '' || customerModel[item] === undefined) {
        delete customerModel[item];
      }
    }
    console.log('customerAfterChangeModel::::::::::::::::::', customerModel);

    let error = '';
    try {
      const { AddNewCustomerResult } = await PnaAddNewCustomer(customerModel);
      console.log('aaaaaaa:::::', AddNewCustomerResult);
      const { attributes } = AddNewCustomerResult;

      if (attributes.Status == 'Successed') {
        newInfo.ISForeignNationals = getInfo['ISForeignNationals'] === 'true';
        newInfo.savedId = attributes.SavedID;
        newInfo.res = JSON.stringify(AddNewCustomerResult);
        return this.CustomerModel.create(newInfo);
      } else {
        error = attributes.ErrorMessage;
      }
    } catch (e) {
      console.log(e);
    }
    if (!!error) {
      throw new InternalServerErrorException(error);
    }
  }
  async updateCustomer(getInfo: MerchantPspCustomerDto): Promise<any> {
    const newInfo = getInfo;
    const customerModel = await MerchantPspPnaCustomerModel(getInfo, false);
    console.log('aaaaAAAA::::::::::::::::::', customerModel);

    let error = '';
    try {
      const { UpdateCustomerResult } = await PnaUpdateCustomer(customerModel);
      console.log('aaaaaaa:::::', UpdateCustomerResult);

      const { attributes } = UpdateCustomerResult;

      if (attributes.Status == 'Successed') {
        newInfo.ISForeignNationals = getInfo['ISForeignNationals'] === 'true';
        newInfo.savedId = attributes.SavedID;
        return this.CustomerModel.findOneAndUpdate({ savedId: newInfo.savedId }, newInfo, { new: true });
      } else {
        error = attributes.ErrorMessage;
      }
    } catch (e) {
      console.log(e);
    }
    if (!!error) {
      throw new InternalServerErrorException(error);
    }
  }
}
