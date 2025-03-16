import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';

export const mergeCards = (usersCard, giftCards) => {
  if (giftCards.length > 0 && usersCard.length > 0) {
    return [...usersCard[0].cardsNo, ...giftCards[0].cards];
  }

  if (giftCards.length == 0 && usersCard.length > 0) {
    return usersCard[0].cardsNo;
  }

  if (giftCards.length == 1 && usersCard.length == 0) {
    return giftCards[0].cards;
  }

  throw new UserCustomException('آماری برای این گروه وجود ندارد');
};

export const organizationOutPut = (organization, m) => {
  if (organization.length > 0) {
    return {
      total: organization[0].amount || 0,
      used: m[0].organization || 0,
      mod: organization[0].amount - m[0].organization || 0,
    };
  } else {
    return {
      total: 0,
      used: 0,
      mod: 0,
    };
  }
};

export const statisticsAmountMemebr = (data, zero) => {
  if (data.length > 0) {
    return {
      mod: data[0].cards.length - zero,
      amount: data[0].amount,
    };
  } else {
    return {
      mod: 0,
      amount: 0,
    };
  }
};
