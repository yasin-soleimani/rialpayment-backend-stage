import { Connection } from 'mongoose';
import { CardSchema } from './schemas/card.schema';
import { CardHistorySchema } from './schemas/history.schema';
import { CardDynamicPassScehma } from './schemas/dynamic.schema';
import { CardTransferSchema } from './schemas/card-trans.schema';
import { CardChargeHistorySchema } from './schemas/card-charge-history.schema';

export const CardProviders = [
  {
    provide: 'CardModel',
    useFactory: (connection: Connection) => connection.model('Card', CardSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'CardHistoryModel',
    useFactory: (connection: Connection) => connection.model('CardHistory', CardHistorySchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'CardDynamicPassModel',
    useFactory: (connection: Connection) => connection.model('CardDynamicPass', CardDynamicPassScehma),
    inject: ['DbConnection'],
  },
  {
    provide: 'CardTransferModel',
    useFactory: (connection: Connection) => connection.model('CardTransfer', CardTransferSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'CardChargeHistoryModel',
    useFactory: (connection: Connection) => connection.model('CardChargeHistory', CardChargeHistorySchema),
    inject: ['DbConnection'],
  },
];
