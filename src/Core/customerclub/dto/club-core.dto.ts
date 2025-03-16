export class ClubCoreDto {
  title: string;
  user: string;
  ref: string;
  priority: any;
  customerwage: any;
  owner?: string;
  merchantwage: any;
  personalpage: {
    status: string;
    domain: string;
  };
  cardinfo: {
    status?: any;
    price?: number;
    max: number;
    giftcard?: number;
  };
  clubinfo: {
    tell: number;
    fax: number;
    email: string;
    website: string;
    address: string;
    province: string;
    city: string;
  };
  sms: {
    provider: string;
    username: string;
    password: string;
  };
  merchant: {
    status: boolean;
    price: number;
    max: number;
  };
  userinfo: {
    status: boolean;
    price: number;
    max: number;
  };
  operator: {
    status: boolean;
    max: number;
    price: number;
  };
  ads: {
    birthday: boolean;
    advert: boolean;
    system: boolean;
    trax: boolean;
  };
  expire?: string;
}
