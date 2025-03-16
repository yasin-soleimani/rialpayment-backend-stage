import { Connection } from 'mongoose';
import { CheckoutBanksSchema } from './schema/banks.schema';
import { CheckoutBankAccountSchema } from './schema/accounts.schema';
import { CheckoutCurrentCheckoutSchema } from './schema/current-account.schema';

export const CheckoutBankProviders = [
  {
    provide: 'CheckoutBanksModel',
    useFactory: (connection: Connection) => connection.model('CheckoutBank', CheckoutBanksSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'CheckoutBankAccountsModel',
    useFactory: (connection: Connection) => connection.model('CheckoutBankAccounts', CheckoutBankAccountSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'CheckoutCurrentAccountModel',
    useFactory: (connection: Connection) => connection.model('CheckoutCurrentAccount', CheckoutCurrentCheckoutSchema),
    inject: ['DbConnection'],
  },
];
