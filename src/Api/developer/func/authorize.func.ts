import { imageTransform } from '@vision/common/transform/image.transform';

export function developerAuthorizeModel(data) {
  let tmpArray = Array();

  for (const info of data) {
    tmpArray.push({
      _id: info._id,
      user: info.user,
      website: info.website,
      apikey: info.apikey,
      callback: info.callback,
      tel: info.tel,
      mobile: info.mobile,
      description: info.description,
      logo: imageTransform(info.logo),
      title: info.title,
      postalcode: info.postalcode,
      address: info.address,
      email: info.email || '',
      status: info.status,
      type: info.type,
      ip: info.ip,
      createdAt: info.createdAt,
    });
  }

  return tmpArray;
}
