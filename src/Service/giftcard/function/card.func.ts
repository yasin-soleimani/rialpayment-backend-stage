export const GiftCardModel = (data) => {
  if (!data) return null;
  if (!data.card) return null;

  return {
    cardno: data.card.cardno,
    cvv2: data.card.cvv2,
    expire: data.card.expire,
    pin: data.card.pin,
  };
};
