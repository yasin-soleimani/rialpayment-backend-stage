import { Injectable } from "@vision/common";
import { InAppPurchasePaymentDto } from "./dto/paymend-details.dto";
import { InAppPurchaseSwitchCoreService } from "./services/switch.service";

@Injectable()
export class InAppPurchaseCoreService {

  constructor(
    private readonly paymentService: InAppPurchaseSwitchCoreService
  ) { }

  async getPayment(getInfo: InAppPurchasePaymentDto): Promise<any> {
    return this.paymentService.payment(getInfo);
  }


}