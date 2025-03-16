import { Injectable } from '@vision/common';
import { IpgCoreService } from '../../Core/ipg/ipgcore.service';
import { PspverifyCoreService } from '../../Core/psp/pspverify/pspverifyCore.service';
import { LoggercoreService } from '../../Core/logger/loggercore.service';

@Injectable()
export class BackofficeDashboardService {
  constructor(
    private readonly ipgService: IpgCoreService,
    private readonly pspVerifyService: PspverifyCoreService,
    private readonly loggerService: LoggercoreService
  ) {}

  async getIpgLast15(limit: number): Promise<any> {
    const success = await this.ipgService.getLast15DaysSuccessChart(limit);
    const faild = await this.ipgService.getLast15DaysFaildChart(limit);
    const posSuccess = await this.pspVerifyService.getSuccess(limit);
    const posFaild = await this.pspVerifyService.getFaild(limit);
    const webServiceSuccess = await this.loggerService.getSuccessWebservice(limit);
    const webServiceFaild = await this.loggerService.getFaildWebservice(limit);

    return {
      success: true,
      status: 200,
      message: 'عملیات با موفقیت انجام شد',
      data: {
        ipg: {
          success: success,
          faild: faild,
        },
        pos: {
          success: posSuccess,
          faild: posFaild,
        },
        webservice: {
          success: webServiceSuccess,
          faild: webServiceFaild,
        },
      },
    };
  }
}
