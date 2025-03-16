import { Connection } from 'mongoose';
import { OperatorSchema } from './schema/operator.schema';

export const OperatorProviders = [
  {
    provide: 'OperatorModel',
    useFactory: (connection: Connection) => connection.model('Operator', OperatorSchema),
    inject: ['DbConnection'],
  },
];
