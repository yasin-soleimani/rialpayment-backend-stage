import { Injectable } from '@vision/common';
import { MerchantPspTypes } from '../const/psp.const';
import { MerchantPspCustomerDto } from '../dto/customer.dto';
import { MerchantPspRequestDto } from '../dto/request.dto';
import { MerchantPspCorePnaDocumentService } from './pna/docment.service';
import { MerchantPspCorePnaSubmitService } from './pna/submit.service';
import { DocumentTypesEnum } from '../enums/document-types-enum';
import { GetRequestDetailByFollowupCodeDto } from '../dto/getRequestDetailByFollowupCode.dto';

@Injectable()
export class MerchantPspCoreSubmitService {
  constructor(
    private readonly pnaSubmitService: MerchantPspCorePnaSubmitService,
    private readonly documentService: MerchantPspCorePnaDocumentService
  ) {}

  async submitReqgister(getInfo: MerchantPspRequestDto): Promise<any> {
    if (getInfo.type == MerchantPspTypes.NovinArian) {
      return this.pnaSubmitService.submitRequest(getInfo);
    }
  }
  async BindPosSerialToTerminal(getInfo: MerchantPspRequestDto): Promise<any> {
    if (getInfo.type == MerchantPspTypes.NovinArian) {
      return this.pnaSubmitService.BindPosSerialToTerminal(getInfo);
    }
  }
  async updateRegister(getInfo: MerchantPspRequestDto): Promise<any> {
    if (getInfo.type == MerchantPspTypes.NovinArian) {
      return this.pnaSubmitService.updateRequest(getInfo);
    }
  }
  async updateRequestDocument(getInfo: MerchantPspRequestDto): Promise<any> {
    if (getInfo.type == MerchantPspTypes.NovinArian) {
      return this.pnaSubmitService.updateRequestDocument(getInfo);
    }
  }
  async getRequestByFollowUpCode(getInfo: GetRequestDetailByFollowupCodeDto): Promise<any> {
    if (getInfo.type == MerchantPspTypes.NovinArian) {
      return this.pnaSubmitService.getRequestDetailByFollowupCode(getInfo);
    }
  }
  async GetRequestListlByCustomerCode(getInfo: GetRequestDetailByFollowupCodeDto): Promise<any> {
    if (getInfo.type == MerchantPspTypes.NovinArian) {
      return this.pnaSubmitService.GetRequestListlByCustomerCode(getInfo);
    }
  }
  async GetRequestListlByProductSerial(getInfo: GetRequestDetailByFollowupCodeDto): Promise<any> {
    if (getInfo.type == MerchantPspTypes.NovinArian) {
      return this.pnaSubmitService.GetRequestListlByProductSerial(getInfo);
    }
  }

  async submitCustomer(getInfo: MerchantPspCustomerDto): Promise<any> {
    if (getInfo.type == MerchantPspTypes.NovinArian) {
      return this.pnaSubmitService.submitCustomer(getInfo);
    }
  }

  async updateCustomer(getInfo: MerchantPspCustomerDto): Promise<any> {
    if (getInfo.type == MerchantPspTypes.NovinArian) {
      return this.pnaSubmitService.updateCustomer(getInfo);
    }
  }

  async uploadDocument(userId: string, customerId, type: number, documentType: DocumentTypesEnum, req): Promise<any> {
    return this.documentService.uploadImage(userId, customerId, type, documentType, req);
  }

  async getCountryList(data): Promise<any> {
    return this.pnaSubmitService.getCountryList(data);
  }

  async getCustomerDataByNationalCode(data): Promise<any> {
    return this.pnaSubmitService.getCustomerDataByNationalCode(data);
  }

  async getCityList(data): Promise<any> {
    return this.pnaSubmitService.getCityList(data);
  }
  async getGuildList(data): Promise<any> {
    return this.pnaSubmitService.getGuildsList(data);
  }
  async getPosTypes(data): Promise<any> {
    return this.pnaSubmitService.getPosTypes(data);
  }
  async getPosModelList(data): Promise<any> {
    return this.pnaSubmitService.getPosModelList(data);
  }
  async getBanksList(data): Promise<any> {
    return this.pnaSubmitService.getBanksList(data);
  }

  async getBranchesList(data): Promise<any> {
    return this.pnaSubmitService.getBranchesList(data);
  }
}
