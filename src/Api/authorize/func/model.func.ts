import { imageTransform } from '@vision/common/transform/image.transform';

export function authorizeApiModel(data) {
  let tmpArray = Array();

  for (const info of data) {
    tmpArray.push({
      _id: info._id,
      logo: imageTransform(info.auth.logo),
      website: info.auth.website,
      createdAt: info.createdAt,
      title: info.auth.title,
      status: info.status,
      permissions: {
        info: info.permissions.info.status,
        wallet: info.permissions.buy.status,
        maxbuy: info.permissions.buy.max,
      },
    });
  }

  return tmpArray;
}
