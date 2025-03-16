export function BackofficeAccountBlockFilterReturnModel(data) {
  let tmpArray = Array();

  for (const info of data) {
    tmpArray.push({
      _id: info._id,
      fullname: info.userx[0].fullname || '',
      mobile: info.userx[0].mobile,
      nationalcode: info.userx[0].nationalcode || '',
      description: info.description,
      amount: info.amount,
      type: info.type,
      createdAt: info.createdAt,
    });
  }

  return tmpArray;
}
