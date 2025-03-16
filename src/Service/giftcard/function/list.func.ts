export const ServiceGiftCardList = (data) => {
  let tmp = Array();
  for (const item of data) {
    tmp.push({
      _id: item.group._id,
      title: item.group.title,
      price: item.price,
      discount: item.discount,
    });
  }

  return tmp;
};
