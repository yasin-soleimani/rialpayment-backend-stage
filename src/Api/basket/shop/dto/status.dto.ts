import { ProductSoldStatusEnum } from '../../../../Core/basket/store/enum/product-sold-status-enum';

export class BasketShopStatusApiDto {
  id: string;
  status: ProductSoldStatusEnum;
}
