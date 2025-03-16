export function BackofficeUsersAccountBlockReturnModel(data) {
  let tmpArray = Array();

  for (const info of data) {
    tmpArray.push({
      _id: info._id,
      amount: info.amount,
      status: info.status,
      description: info.description,
      type: info.type,
      createdAt: info.createdAt,
      updatedAt: info.updatedAt,
    });
  }

  return tmpArray;
}
