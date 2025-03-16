export function merchantReportModel(data) {
  let tmpArray = Array();
  for (const info of data) {
    tmpArray.push({
      _id: info._id,
      paid: info.paid,
      fullname: info.user.fullname || 'بی نام',
      mobile: info.user.mobile,
      basket: BaksetProducts(info.basket),
      address: info.address,
      status: info.status || 1,
      total: info.total,
      createdAt: info.createdAt,
    });
  }
  return tmpArray;
}

export function userShopReportModel(data) {
  let tmpArray = Array();

  for (const info of data) {
    tmpArray.push({
      _id: info._id,
      paid: info.paid,
      merchant: {
        title: info.merchant.title,
        tels: info.merchant.tels,
        address: info.merchant.address,
        email: info.merchant.email,
        account_no: info.merchant.account_no,
      },
      basket: BaksetProducts(info.basket),
      address: info.address,
      total: info.total,
      status: info.status || 1,
      createdAt: info.createdAt,
    });
  }
  return tmpArray;
}

function BaksetProducts(data) {
  let tmpArray = Array();

  for (const info of data) {
    tmpArray.push({
      _id: info._id,
      title: info.title,
      qty: info.qty,
      type: info.id.type,
      price: info.price,
      total: info.total,
      fields: [],
      value: [],
    });
  }

  return tmpArray;
}
