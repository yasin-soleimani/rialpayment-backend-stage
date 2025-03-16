export function InsuranceApiListFunction(data) {
  let tmp = Array();

  for (const info of data) {
    tmp.push({
      _id: info._id,
      title: info.title,
      amount: info.amount,
      company: info.company,
      details: info.details.details,
    });
  }

  return tmp;
}
