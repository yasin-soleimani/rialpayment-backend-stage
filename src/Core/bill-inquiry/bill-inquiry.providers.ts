import { Connection } from 'mongoose';
import { BillInquirySchema } from './schema/inquiry.schema';
import { BillInquiryListSchema } from './schema/inquiy-list.schema';

export const BillInquiryProviders = [
  {
    provide: 'BillInquiryModel',
    useFactory: (connection: Connection) => connection.model('BillInquiry', BillInquirySchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'BillInquiryListModel',
    useFactory: (connection: Connection) => connection.model('BillInquiryList', BillInquiryListSchema),
    inject: ['DbConnection'],
  },
];
