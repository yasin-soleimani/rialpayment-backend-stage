import { Provider } from "@vision/common"
import { LeasingUserCreditSchema } from "./schemas/leasing-user-credit.schema"


export const LEASING_USER_CREDIT_PROVIDERS: Provider[] = [
  {
    provide: 'LeasingUserCreditModel',
    useFactory: (connection: any) => connection.model('LeasingUserCredit', LeasingUserCreditSchema),
    inject: ['DbConnection']
  }
]
