export class InAppPurchasePaymentDto {
  userId: string;
  terminalId: number;
  acceptorCode: number;
  ipgTerminalId: number;
  ipgCallback: string;
  amount: number;
  cardInfo: any;
  payload: any;
  paymentPrefix: string;
  paymentLogTitle: string;
  ipg: boolean;
  pin: string;
}