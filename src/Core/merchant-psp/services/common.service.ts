import { Inject, Injectable } from '@vision/common';

@Injectable()
export class MerchantPspCoreCommonService {
  constructor(
    @Inject('MerchantPspRequestModel') private readonly requestModel: any,
    @Inject('MerchantPspCustomerModel') private readonly customerModel: any,
    @Inject('MerchantPspDocumentModel') private readonly fileModel: any,
    @Inject('MerchantPspPosModel') private readonly posModel: any
  ) {}

  async getCustomerInfoByUserId(userId: string): Promise<any> {
    return this.customerModel.findOne({ user: userId });
  }

  async getCustomerList(userId: string, page, limit): Promise<any> {
    return this.customerModel.paginate(
      { user: userId },
      { page: page, sort: { createdAt: -1 }, limit: limit === 0 ? 20 : limit }
    );
  }

  async getRequestInfoById(id: string): Promise<any> {
    return this.requestModel.findOne({ _id: id });
  }

  async getRequestInfoByFollowUpCode(followUpCode: string): Promise<any> {
    return this.requestModel.findOne({ followUpCode });
  }

  async getRequestList(userId: string, customerId, page: number, limit: number): Promise<any> {
    const where = { user: userId };
    if (customerId !== null) {
      where['merchant'] = customerId;
    }
    return this.requestModel.paginate(where, {
      page,
      sort: { createdAt: -1 },
      populate: 'merchant boundId',
      limit: limit,
    });
  }

  async getBoundPosList(userId: string, customerId, page: number, limit: number): Promise<any> {
    const where = { user: userId };
    if (customerId !== null) {
      where['merchant'] = customerId;
    }
    return this.posModel.paginate(where, {
      page,
      sort: { createdAt: -1 },
      limit: limit,
    });
  }

  async getFileListByUserId(userId: string, customerId, documentType: number, type = 0): Promise<any> {
    const where = { user: userId, status: true };
    if (type !== 0) {
      where['fileType.type'] = type;
    }
    if (customerId !== null) {
      where['merchant'] = customerId;
    }
    if (documentType !== 0) {
      where['type'] = documentType;
    }
    return this.fileModel.find(where).populate('merchant').select('-byte');
  }
}
