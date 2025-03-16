export function authorizeWageModel(data) {
  let loginStatus,
    payStatus = false;
  let loginWage,
    loginWageFrom,
    payWageType,
    payWage,
    payWageFrom = 0;
  if (data && data.login) {
    loginStatus = data.login.status;
    loginWage = data.login.wage || 0;
    loginWageFrom = data.login.wagefrom;
  }

  if (data && data.pay) {
    payStatus = data.pay.status;
    payWageType = data.pay.wagetype;
    payWage = data.pay.wage;
    payWageFrom = data.pay.wagefrom;
  }
  return {
    loginstatus: loginStatus || false,
    loginwage: loginWage || 0,
    loginwagefrom: loginWageFrom || 0,
    paystatus: payStatus || false,
    paytype: payWageType || 0,
    paywage: payWage || 0,
    paywagefrom: payWageFrom || 0,
  };
}
