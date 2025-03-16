import { Connection } from 'mongoose';
import { NationalInsuranceSchema } from './schema/insurance.schema';
import { NationalInsurancePersonSchema } from './schema/insurance-persons.schema';
import { NationalInsuranceCategorySchema } from './schema/insurance-category.schema';
import { NationalInsuranceCompanySchema } from './schema/insurance-company.schema';
import { NationalInsurancePriceSchema } from './schema/insurance-price.schema';

export const NationalInsuranceProviders = [
  {
    provide: 'NationalInsuranceModel',
    useFactory: (connection: Connection) => connection.model('NationalInsurance', NationalInsuranceSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'NationalInsurancePersonModel',
    useFactory: (connection: Connection) => connection.model('NationalInsurancePerson', NationalInsurancePersonSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'NationalInsuranceCategoryModel',
    useFactory: (connection: Connection) =>
      connection.model('NationalInsuranceCategory', NationalInsuranceCategorySchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'NationalInsuranceCompanyModel',
    useFactory: (connection: Connection) =>
      connection.model('NationalInsuranceCompany', NationalInsuranceCompanySchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'NationalInsurancePriceModel',
    useFactory: (connection: Connection) => connection.model('NationalInsurancePrice', NationalInsurancePriceSchema),
    inject: ['DbConnection'],
  },
];
