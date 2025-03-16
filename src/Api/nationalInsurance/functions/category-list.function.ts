export function NationalInsuranceCategoryList(data) {
  let tmpArray = Array();

  for (const info of data) {
    tmpArray.push({
      _id: info._id,
      title: info.title,
      code: info.code,
      type: info.details.type,
      price: info.details.price,
      division: info.details.division,
      createdAt: info.createdAt,
      updatedAt: info.updatedAt,
    });
  }

  return tmpArray;
}
