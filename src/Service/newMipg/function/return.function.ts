export function newMipgError(status, error) {
  return {
    status: status,
    errorCode: error.code,
    errorDescription: error.message,
  };
}

export function newMipgRequest(status, invoice_key) {
  return {
    status: status,
    invoice_key: invoice_key,
  };
}

export function newMipgCheckTrans(status, amount, rrn) {
  return {
    status: status,
    amount: amount,
    bank_code: rrn,
  };
}
