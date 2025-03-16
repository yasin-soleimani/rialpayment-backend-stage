export class PaymentRequestParams {
  readonly requestString: string;

  constructor(
    username: string,
    password: string,
    orderId: number,
    amount: number,
    localDate: string,
    additionalData: string,
    callbackUrl: string,
    serviceType: /* P1 */ number = 1,
    paymentId: /* P9 */ number = 0
  ) {
    this.requestString = `${serviceType},${username},${password},${orderId},${amount},${localDate},${additionalData},${callbackUrl},${paymentId}`;
  }

  toString() {
    return this.requestString;
  }
}

export class PaymentRequestData {
  constructor(public merchantConfigurationID: string, public encryptedRequest: string) {
    this.merchantConfigurationID = merchantConfigurationID;
    this.encryptedRequest = encryptedRequest;
  }
}

export class Credentials {
  readonly credentialsString: string;

  constructor(username: string, password: string) {
    this.credentialsString = `${username},${password}`;
  }

  toString() {
    return this.credentialsString;
  }
}
