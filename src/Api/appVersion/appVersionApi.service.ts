import { Injectable, successOptWithData, successOptWithDataNoValidation } from '@vision/common';
import { GeneralService } from '../../Core/service/general.service';
import { AppVersionsCoreService } from '../../Core/appVersion/app-versions.service';

@Injectable()
export class AppVersionApiService {
  constructor(
    private readonly versionsService: AppVersionsCoreService,
    private readonly generalService: GeneralService
  ) {}

  async getLastVersion() {
    const lastVersion = await this.versionsService.getLast();
    const lastForce = await this.versionsService.getLastForce();
    console.log(lastVersion, lastForce);
    return successOptWithDataNoValidation({
      ...lastVersion,
      fileName: process.env.SITE_URL + lastVersion.fileName,
      minVersion: lastForce ? lastForce.version : 0,
    });
  }
}
