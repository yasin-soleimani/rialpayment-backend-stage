import { Connection } from 'mongoose';
import { merchantSettlementReportSchema } from '../schemas/merchant-settlement-report.schema';
import { Provider } from '@vision/common';
import { merchantSettlementsSchema } from '../schemas/merchant-settlements.schema';
import { merchantSettlementCashoutSchema } from '../schemas/merchant-settlement-cashout.schema';

export const merchantSettlementProvider: Provider[] = [
  {
    provide: 'MerchantSettlementsModel',
    useFactory: (connection: Connection) => connection.model('MerchantSettlement', merchantSettlementsSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'MerchantSettlementReportModel',
    useFactory: (connection: Connection) =>
      connection.model('MerchantSettlementReport', merchantSettlementReportSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'MerchantSettlementsCashoutModel',
    useFactory: (connection: Connection) =>
      connection.model('MerchantSettlementCashout', merchantSettlementCashoutSchema),
    inject: ['DbConnection'],
  },
];
