import { Connection } from 'mongoose';
import { MainInsuranceCompanySchema } from './schema/company.shcema';
import { MainInsuranceProductSchema } from './schema/products.schema';
import { MainInsuranceCategorySchema } from './schema/category.schema';
import { MainInsuranceDetailsSchema } from './schema/details.schema';
import { MainInsuranceHistorySchema } from './schema/history.schema';

export const MainInsuranceProviders = [
  {
    provide: 'MainInsuranceCompanyModel',
    useFactory: (connection: Connection) => connection.model('MainInsuranceCompany', MainInsuranceCompanySchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'MainInsuranceProductModel',
    useFactory: (connection: Connection) => connection.model('MainInsuranceProduct', MainInsuranceProductSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'MainInsuranceCategoryModel',
    useFactory: (connection: Connection) => connection.model('MainInsuranceCategory', MainInsuranceCategorySchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'MainInsuranceDetailsModel',
    useFactory: (connection: Connection) => connection.model('MainInsuranceDetails', MainInsuranceDetailsSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'MainInsuranceHistoryModel',
    useFactory: (connection: Connection) => connection.model('MainInsuranceHistoryModel', MainInsuranceHistorySchema),
    inject: ['DbConnection'],
  },
];
