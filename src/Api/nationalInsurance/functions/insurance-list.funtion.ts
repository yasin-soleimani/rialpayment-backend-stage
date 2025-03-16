export function NationalInsuranceListItearor(data) {
  let tmpArray = Array();

  for (const info of data) {
    tmpArray.push({
      _id: info.id,
      fullname: info.user.firstname + ' ' + info.user.lastname,
      ref: info.ipg.userinvoice,
      qty: info.qty,
      total: info.total,
      category: info.category.title,
      createdAt: info.createdAt,
    });
  }

  return tmpArray;
}
