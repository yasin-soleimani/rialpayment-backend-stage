import { BasketParcelProductSpecialPriceDto } from '../../../../Api/basket/product/dto/product.dto';

export class BasketProductDto {
  title: string;
  type: number;
  qtyType?: number;
  qty: number;
  price: number;
  description: string;
  img: string;
  category: string;
  categoryMap?: any;
  user: string;
  fields: any;
  metaTitle: string;
  metaDescription: string;
  specialSell?: BasketParcelProductSpecialPriceDto | string;
  slug: string;
  id?: string;
  isHyper?: boolean;
  isJustMyShop?: boolean;
}
