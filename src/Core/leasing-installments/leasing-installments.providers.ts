import { Provider } from "@vision/common"
import { LeasingInstallmentsSchema } from "./schemas/leasing-installments.schema"


export const LEASING_INSTALLMENTS_PROVIDERS: Provider[] = [
  {
    provide: "LeasingInstallmentsModel",
    useFactory: (connection: any) => connection.model("LeasingInstallments", LeasingInstallmentsSchema),
    inject: ["DbConnection"]
  }
]
