import { Connection } from 'mongoose';
import { InternetPaymentGatewayLogSchema } from './schema/internet-payment-gateway-log.schema';

export const InternetPaymentGatewayProviders = [
  {
    provide: 'InternetPaymentGatewayLogModel',
    useFactory: (connection: Connection) =>
      connection.model('InternetPaymentGatewayLog', InternetPaymentGatewayLogSchema),
    inject: ['DbConnection'],
  },
];
