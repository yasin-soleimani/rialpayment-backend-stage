import { Injectable } from '@vision/common';

@Injectable()
export class MerchantService {
  constructor() {}
  static successOpt() {
    return {
      success: true,
      status: 200,
      message: 'عملیات با موفقیت انجام شد',
    };
  }
}
