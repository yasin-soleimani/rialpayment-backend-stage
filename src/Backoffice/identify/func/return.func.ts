export async function backofficeIdentifyReturnList(data) {
  let tmpArray = Array();
  for (const info of data) {
    tmpArray.push({
      _id: info._id[0],
      fullname: info.fullname[0] || 'بی نام',
      mobile: info.mobile[0],
      nationalcode: info.nationalcode[0] || '',
    });
  }

  return tmpArray;
}
