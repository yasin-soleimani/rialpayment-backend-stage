import { Connection } from 'mongoose';
import { TicketsSchemaSchema } from './schema/tickets.schema.schema';
import { TicketsHistorySchema } from './schema/tickets.history.schema.schema';

export const TicketsProvider = [
  {
    provide: 'TicketsModel',
    useFactory: (connection: Connection) => connection.model('Ticket', TicketsSchemaSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'TicketsHistoryModel',
    useFactory: (connection: Connection) => connection.model('TicketsHistory', TicketsHistorySchema),
    inject: ['DbConnection'],
  },
];
