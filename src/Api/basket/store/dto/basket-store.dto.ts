export class BasketStoreApiDto {
  user: string;
  readonly status: boolean;
  readonly title: string;
  readonly email: string;
  readonly description: string;
  nickname: string;
  tels: string | string[];
  readonly about: string;
  readonly metaTitle: string;
  readonly metaDescription: string;
  logo: string;
  hasIranianShop: boolean | 'true' | 'false';
  hasOwnShop: boolean | 'true' | 'false';
  isHyper: boolean | 'true' | 'false';
  ownShopTitle: string;
  ownShopUrl: string;
  mobiles: number[];
  ownShopAbout: string;
  banner: string;
  banners: string[];
}
