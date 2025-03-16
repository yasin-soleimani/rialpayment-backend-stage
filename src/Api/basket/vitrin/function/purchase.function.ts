export const InAppPurchaseVitrinPayloadFunction = (shopId: string, getInfo, storeInfo) => {
  return {
    basketShopId: shopId,
    devicetype: getInfo.devicetype,
    storeUser: storeInfo.user,
    nickname: storeInfo.nickname
  }
}

export const InAppPurchaseVitrinModelFunction = (account_no, userInfo, amount, userId, callback, payload, pin, devicetype) => {
  return {
    account_no,
    mobile: userInfo.mobile,
    fullname: userInfo.fullname,
    amount: amount,
    user: userId,
    callbackurl: callback,
    payload,
    pin,
    devicetype: devicetype
  }
}