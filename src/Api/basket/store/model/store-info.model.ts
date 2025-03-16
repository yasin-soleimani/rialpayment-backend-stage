export function BasketStoreInfo(data) {
  if (!data) return null;
  let terminalinfo = null;
  if (data.mipg) {
    terminalinfo = {
      terminalid: data.mipg.terminalid,
      title: data.mipg.title,
    };
  }
  return {
    _id: data._id,
    user: data.user,
    status: data.status,
    title: data.title,
    tels: data.tels,
    description: data.description,
    about: data.about,
    email: data.email,
    logo: data.logo,
    banner: '',
    banners: data.banners,
    nickname: data.nickname,
    terminalinfo: terminalinfo,
    hasIranianShop: data.hasIranianShop,
    hasOwnShop: data.hasOwnShop,
    ownShopTitle: data.ownShopTitle,
    ownShopUrl: data.ownShopUrl,
    ownShopAbout: data.ownShopAbout,
    hasDelivery: data.hasDelivery || false,
    deliveryPrice: data.deliveryPrice || null,
    deliveryDescription: data.deliveryDescription || '',
    hasPishtaz: data.hasPishtaz || false,
    pishtazPrice: data.pishtazPrice || null,
    pishtazDescription: data.pishtazDescription || '',
    hasFreeShipping: data.hasFreeShipping || false,
    freeShippingAmount: data.freeShippingAmount || null,
    isHyper: data.isHyper || false,
    hasDeliveryToWholeCountry: data.hasDeliveryToWholeCountry === null ? true : data.hasDeliveryToWholeCountry,
    deliveryProvince: data.deliveryProvince || '',
    deliveryCity: data.deliveryCity || '',
    mobiles: data.mobiles || [],
    deliveryTimeout: data.deliveryTimeout || 0,
  };
}
