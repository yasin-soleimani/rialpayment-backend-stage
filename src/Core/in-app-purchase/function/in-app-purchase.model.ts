export const inAppPurchaseModel = (userId, terminalId, acceptorCode, ipgTerminalId, ipgCallback, amount, cardInfo, payload, paymentPrefix, paymentLogTitle, ipg, pin) => {
  return {
    userId,
    terminalId,
    acceptorCode,
    ipgTerminalId,
    ipgCallback,
    amount,
    cardInfo,
    payload,
    paymentPrefix,
    paymentLogTitle,
    ipg,
    pin
  }
}