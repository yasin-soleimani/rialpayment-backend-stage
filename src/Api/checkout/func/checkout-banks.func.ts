export function CheckoutBanksApiReturnModel(data, instat, shaparak) {
  let banks = Array();

  for (const info of data.bank) {
    banks.push({
      bankname: info.title,
      code: info.code,
    });
  }

  let shebas = Array();
  if (data.sheba == true) {
    shebas = shaparak;
  }
  return {
    banks: banks,
    sheba: data.sheba,
    instant: instat,
    shaparak: shebas,
    cashout: data.cashoutapi,
  };
}
