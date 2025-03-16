import { Injectable } from "@vision/common";
import { InAppPurcahseIpgCallBackApiService } from "./services/callback.service";

@Injectable()
export class InAppPurchaseApiService {

  constructor(private readonly callbackService: InAppPurcahseIpgCallBackApiService) { }

  async callback(getInfo, res): Promise<any> {
    return this.callbackService.callback(getInfo, res);
  }
}