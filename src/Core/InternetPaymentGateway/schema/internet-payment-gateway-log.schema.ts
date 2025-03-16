import * as mongoose from 'mongoose';

export const InternetPaymentGatewayLogSchema = new mongoose.Schema({
  terminalid: { type: String },
  merchantid: { type: String },
  ip: { type: String },
  message: { type: String },
  request: { type: String },
});
