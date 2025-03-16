export function ChargeCallbackFunction(type) {
  switch (type) {
    case 1: {
      return 'https://core-backend.rialpayment.ir/v1/payment/callback/parsian';
    }

    case 2: {
      return 'https://core-backend.rialpayment.ir/v1/payment/callback/persian';
    }

    case 3: {
      return 'https://core-backend.rialpayment.ir/v1/payment/callback/saman';
    }
  }
}
