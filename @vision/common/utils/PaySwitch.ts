import { CardTypeEnum } from "@vision/common/enums/card-opt.enum"
import { CardsStarters } from "../enums/cards-starters"

export function switchPay(cardnum) {
  const pan = cardnum.toString().substring(0, 6);
  if (CardsStarters.includes(pan)) {
    return 'closeloop';
  } else {
    return 'shetab';
  }
}
