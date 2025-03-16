"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const momentjs = require("jalali-moment");
function getLast5Digits(cardNo) {
    const card = cardNo.toString();
    return card.substr(card.length - 5);
}
exports.getLast5Digits = getLast5Digits;
function checkExpireCard(date, expire) {
    const year = momentjs(date).locale('fa').format('YY/MM');
    console.log(year, expire);
    if (year != expire)
        return false;
    return true;
}
exports.checkExpireCard = checkExpireCard;
//# sourceMappingURL=format.func.js.map