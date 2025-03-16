import * as momentjs from 'jalali-moment';

export function getLast5Digits(cardNo) {
  const card = cardNo.toString();
  return card.substr(card.length - 5);
}

export function checkExpireCard(date, expire) {
  const year = momentjs(Number(date)).locale('fa').format('YY/MM');
  if (year != expire) return false;
  return true;
}
