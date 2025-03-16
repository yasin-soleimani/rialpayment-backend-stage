export class ClientSalePaymentRequestData {
  constructor(
    public LoginAccount: string,
    public Amount: number,
    public OrderId: number,
    public CallBackUrl: string,
    public AdditionalData: string
  ) {
    this.LoginAccount = LoginAccount;
    this.Amount = Amount;
    this.OrderId = OrderId;
    this.CallBackUrl = CallBackUrl;
    this.AdditionalData = AdditionalData;
  }
}

export class ClientConfirmRequestData {
  constructor(public LoginAccount: string, public Token: number) {
    this.LoginAccount = LoginAccount;
    this.Token = Token;
  }
}
