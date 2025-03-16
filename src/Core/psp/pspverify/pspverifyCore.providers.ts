import { Connection } from 'mongoose';
import { PspverifyCoreSchema } from './schemas/pspverifyCore.schema';
import { PSPRequestSchema } from './schemas/psp-request.schema';
import { PSPCreditSchema } from './schemas/psp-credit.schema';
import { PSPDiscountSchema } from './schemas/psp-discount.schema';
import { PspOrganizationSchema } from './schemas/psp-organization.schema';

export const PspverifyCoreProviders = [
  {
    provide: 'PspVerifyModel',
    useFactory: (connection: Connection) => connection.model('Pspverify', PspverifyCoreSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'PspRequestModel',
    useFactory: (connection: Connection) => connection.model('PspRequest', PSPRequestSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'PspCreditModel',
    useFactory: (connection: Connection) => connection.model('PspCredit', PSPCreditSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'PspDiscountModel',
    useFactory: (connection: Connection) => connection.model('PspDiscount', PSPDiscountSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'PspOrganModel',
    useFactory: (connection: Connection) => connection.model('PspOrgan', PspOrganizationSchema),
    inject: ['DbConnection'],
  },
];
