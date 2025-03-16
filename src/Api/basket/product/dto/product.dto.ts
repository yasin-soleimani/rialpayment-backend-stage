import { Types } from 'mongoose';

export class BasketParcelProductDetailDto {
  _id?: string | Types.ObjectId;
  id?: string | Types.ObjectId;
  qty: number;
  price: number;
  color: string;
  size: string;
  qtyType: number;
  qtyRatio: number;
  specialSell?: BasketParcelProductSpecialPriceDto | string;
}
export class BasketParcelProductSpecialPriceDto {
  price: number;
  from?: number;
  to?: number;
  qtyType?: number;
}

export class BasketProductApiDto {
  title: string;
  type: number;
  qtyType: number;
  qty: number;
  qtyRatio: number;
  price: number;
  description: string;
  img: string;
  category: string;
  categoryMap?: string;
  user: string;
  fields: any;
  metaTitle: string;
  metaDescription: string;
  hasDetails: boolean;
  slug: string;
  specialSell?: BasketParcelProductSpecialPriceDto | string;
  details?: BasketParcelProductDetailDto[] | string;
  id?: string;
}
