import { Connection } from 'mongoose';
import { MerchantcoreSchema } from './schemas/merchantcore.schema';
import { MerchanthistoryCoreSchema } from './schemas/merchanthistorycore.schema';
import { MerchantTerminalCoreSchema } from './schemas/merchant-terminal.schema';
import { MerchantDiscountSrategyCoreSchema } from './schemas/merchant-strategy.schema';
import { TerminalBookmarkSchema } from './schemas/merchant-terminal-bookmark.schema';
import { TerminalBalanceSchema } from './schemas/terminalbalance.schema';
import { DispatchermerchantSchema } from '../dispatcher/schema/dispatcher-merchants.schema';
import { MerchantTerminalShebaSchema } from './schemas/merchant-terminal-sheba.schema';
import { MerchantTerminalPosInfoSchema } from './schemas/merchant-terminal-pos-info.schema';
import { MerchantTerminalPosInfoHistorySchema } from './schemas/merchant-terminal-pos-info-history.schema';
import { merchantShareSchema } from './schemas/merchant-share.schema';

export const MerchantcoreProviders = [
  {
    provide: 'MerchantModel',
    useFactory: (connection: Connection) => connection.model('Merchant', MerchantcoreSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'MerchantTerminalModel',
    useFactory: (connection: Connection) => connection.model('MerchantTerminal', MerchantTerminalCoreSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'MerchantHistoryModel',
    useFactory: (connection: Connection) => connection.model('MerchantHistory', MerchanthistoryCoreSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'MerchantStrategyModel',
    useFactory: (connection: Connection) => connection.model('MerchantStrategy', MerchantDiscountSrategyCoreSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'TerminalBookmarkModel',
    useFactory: (connection: Connection) => connection.model('TerminalBookmark', TerminalBookmarkSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'TerminalBalanceModel',
    useFactory: (connection: Connection) => connection.model('TerminalBalance', TerminalBalanceSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'DispatchermerchantModel',
    useFactory: (connection: Connection) => connection.model('Dispatchermerchant', DispatchermerchantSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'MerchantTerminalShareModel',
    useFactory: (connection: Connection) => connection.model('MerchantTerminalShare', MerchantTerminalShebaSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'MerchantTerminalPosInfoModel',
    useFactory: (connection: Connection) => connection.model('MerchantTerminalPosInfo', MerchantTerminalPosInfoSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'MerchantTerminalPosInfoHistoryModel',
    useFactory: (connection: Connection) =>
      connection.model('MerchantTerminalPosInfoHistory', MerchantTerminalPosInfoHistorySchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'MerchantShareModel',
    useFactory: (connection: Connection) => connection.model('MerchantShare', merchantShareSchema),
    inject: ['DbConnection'],
  },
];
