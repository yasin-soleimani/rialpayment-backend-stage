import { Connection } from 'mongoose';
import { Provider } from '@vision/common';
import { leasingFormSchema } from './schemas/leasing-form.schema';

export const LeasingFormProviders: Provider[] = [
  {
    provide: 'LeasingFormModel',
    useFactory: (connection: Connection) => connection.model('LeasingForm', leasingFormSchema),
    inject: ['DbConnection'],
  },
];
