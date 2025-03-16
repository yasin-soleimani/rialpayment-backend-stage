import { imageTransform } from '@vision/common/transform/image.transform';

export function ChargeServiceReturnModel(data) {
  const edgeAmount = 5000000;
  let remain = null;
  if (!data.user && data.amount >= edgeAmount) {
    remain = null;
  }
  if (!data.user && data.amount >= 0 && data.amount < 4999899) {
    remain = edgeAmount - data.amount;
  }

  let fullname, avatar;
  if (!data.user) {
    fullname = 'بی نام';
    avatar = '';
  } else {
    fullname = data.user.fullname || 'بی نام';
    avatar = imageTransform(data.user.avatar);
  }
  return {
    cardno: data.cardno,
    fullname: fullname || 'بی نام',
    avatar: avatar,
    remain: remain,
  };
}
