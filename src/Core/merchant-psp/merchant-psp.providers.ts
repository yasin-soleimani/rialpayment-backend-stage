import { Connection } from 'mongoose';
import { MerchantPspCustomerSchema } from './schema/merchant-psp-customer.schema';
import { MerchantPspFileSchema } from './schema/merchant-psp-files.schema';
import { MerchantPspRequestSchema } from './schema/merchant-psp-request.schema';
import { MerchantPspPosSchema } from './schema/merchant-psp-pos.schema';

export const MerchantPspProviders = [
  {
    provide: 'MerchantPspCustomerModel',
    useFactory: (connection: Connection) => connection.model('MerchantPspCustomer', MerchantPspCustomerSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'MerchantPspRequestModel',
    useFactory: (connection: Connection) => connection.model('MerchantPspRequest', MerchantPspRequestSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'MerchantPspDocumentModel',
    useFactory: (connection: Connection) => connection.model('MerchantPspDocument', MerchantPspFileSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'MerchantPspPosModel',
    useFactory: (connection: Connection) => connection.model('MerchantPspPos', MerchantPspPosSchema),
    inject: ['DbConnection'],
  },
];
