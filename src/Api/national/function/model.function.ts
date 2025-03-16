import { imageTransform } from '@vision/common/transform/image.transform';

export function NationalGetListModel(data) {
  let tmp = Array();
  for (const info of data) {
    tmp.push({
      _id: info._id,
      firstname: info.firstname,
      lastname: info.lastname,
      father: info.father,
      sex: info.sex,
      marriage: info.marriage,
      birthdate: info.birthdate,
      place: info.place,
      visatype: info.visatype,
      passport: info.passport,
      amayesh: info.amayesh,
      residencetype: info.residencetype,
      otherresidencetype: info.otherresidencetype,
      visaexpire: info.visaexpire,
      economiccode: info.economiccode,
      job: info.job,
      education: info.education,
      familymembersno: info.familymembersno,
      tel: info.tel,
      mobile: info.mobile,
      address: info.address,
      description: info.description,
      postalcode: info.postalcode,
      status: info.status || 1,
      idcode: info.idcode,
      sheba: info.sheba,
      familycode: info.familycode,
      docs: docs(info.docs),
    });
  }
  return tmp;
}

function docs(data) {
  let tmp = Array();
  for (const info of data) {
    tmp.push({
      key: info.field,
      value: imageTransform(info.img),
    });
  }
  return tmp;
}
