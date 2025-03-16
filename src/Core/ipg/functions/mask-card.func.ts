export function maskCardNumber(cardno) {
  const pan1 = cardno.substr(0, 6);
  const pan2 = cardno.substr(12);
  return pan1 + '******' + pan2;
}
