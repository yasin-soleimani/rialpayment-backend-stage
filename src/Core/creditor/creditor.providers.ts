import { Connection } from 'mongoose';
import { CreditorSchema } from './schema/creditor.schema';
import { CreditorSubjectSchema } from './schema/creditor-subject.schema';

export const CreditorProviders = [
  {
    provide: 'CreditorModel',
    useFactory: (connection: Connection) => connection.model('Creditor', CreditorSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'CreditorSubjectModel',
    useFactory: (connection: Connection) => connection.model('CreditorSubject', CreditorSubjectSchema),
    inject: ['DbConnection'],
  },
];
