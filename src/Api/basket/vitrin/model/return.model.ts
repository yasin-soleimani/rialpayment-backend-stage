import * as process from 'process';

export function returnStoreInfoModel(data) {
  const linkAddress = process.env.LINK_APP_URL_ADDRESS.endsWith('/')
    ? process.env.LINK_APP_URL_ADDRESS
    : process.env.LINK_APP_URL_ADDRESS + '/';
  const siteUploadUrl = process.env.SITE_URL.endsWith('/') ? process.env.SITE_URL : process.env.SITE_URL + '/';
  return {
    showMyIranianShopLink: data.user.showMyIranianShopLink,
    showMyOwnShopLink: data.user.showMyOwnShopLink,
    showMyTransferLink: data.user.showMyTransferLink,
    ownShopTitle: data.user.showMyOwnShopLink ? data.ownShopTitle : '',
    ownShopUrl: data.user.showMyOwnShopLink ? data.ownShopUrl : '',
    ownShopAbout: data.user.showMyOwnShopLink ? data.ownShopAbout : '',
    deliveryOptions: initiateDeliveryOptions(data),
    hasFreeShipping: data.hasFreeShipping || false,
    freeShippingAmount: data.freeShippingAmount || null,
    account_no: data.user.account_no,
    about: data.about,
    description: data.description,
    email: data.email,
    logo: data.logo ? siteUploadUrl + data.logo : siteUploadUrl + data.user.avatar,
    banner: data?.banner ? siteUploadUrl + data.banner : '',
    banners: data?.banners,
    mipg: null,
    status: data.status,
    isHyper: data.isHyper,
    hasCashOnDelivery: data?.hasCashOnDelivery ?? false,
    tels: data.tels,
    title: data.title,
    fullname: data.user.islegal ? data.user.legal.name : data.user.fullname,
    storeUrl: data.user.showMyIranianShopLink ? linkAddress + 'store/' + data.nickname : '',
    transferUrl: linkAddress + 'transfer/' + data.user.account_no,
    _id: data._id,
  };
}

export function returnUserOnlyInfoModel(data: { user: any }) {
  const linkAddress = process.env.LINK_APP_URL_ADDRESS.endsWith('/')
    ? process.env.LINK_APP_URL_ADDRESS
    : process.env.LINK_APP_URL_ADDRESS + '/';
  const siteUploadUrl = process.env.SITE_URL.endsWith('/') ? process.env.SITE_URL : process.env.SITE_URL + '/';
  return {
    showMyIranianShopLink: data.user.showMyIranianShopLink,
    showMyOwnShopLink: data.user.showMyOwnShopLink,
    showMyTransferLink: data.user.showMyTransferLink,
    ownShopTitle: '',
    ownShopUrl: '',
    ownShopAbout: '',
    account_no: data.user.account_no,
    logo: siteUploadUrl + data.user.avatar,
    fullname: data.user.fullname,
    storeUrl: '',
    transferUrl: linkAddress + 'transfer/' + data.user.account_no,
  };
}

function initiateDeliveryOptions(data: any): any[] {
  const deliveryOptions = [];
  if (data.hasDelivery)
    deliveryOptions.push({
      id: 1,
      title: 'ارسال با پیک',
      amount: data.deliveryPrice,
      description: data.deliveryDescription,
    });
  if (data.hasPishtaz)
    deliveryOptions.push({
      id: 2,
      title: 'ارسال با پست پیشتاز',
      amount: data.pishtazPrice,
      description: data.pishtazDescription,
    });
  return deliveryOptions;
}
