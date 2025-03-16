import { imageTransform } from '@vision/common/transform/image.transform';

export function backofficeReturnIdentifyList(data) {
  let tmpArray = Array();

  for (const info of data) {
    tmpArray.push({
      _id: info._id,
      ninfront: imageTransform(info.ninfront),
      ninback: imageTransform(info.ninback),
      createdAt: info.createdAt,
    });
  }

  return tmpArray;
}
