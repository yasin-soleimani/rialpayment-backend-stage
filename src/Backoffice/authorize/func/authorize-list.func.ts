import { imageTransform } from '@vision/common/transform/image.transform';

export function backofficeAuthorizeListModel(data) {
  let tmpArray = Array();

  for (const info of data) {
    tmpArray.push({
      _id: info._id,
      logo: imageTransform(info.logo),
      userid: info.user._id,
      fullname: info.user.fullname,
      mobile: info.mobile,
      nationalcode: info.user.nationalcode,
      website: info.website,
      createdAt: info.createdAt,
      title: info.title,
      status: info.status,
      type: info.type,
      description: info.description,
      tel: info.tel,
      email: info.email,
      apikey: info.apikey || ' ',
      callback: info.callback,
      postalcode: info.postalcode,
      address: info.address,
      ip: info.ip,
    });
  }

  return tmpArray;
}
