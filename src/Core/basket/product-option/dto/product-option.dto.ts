export class BasketProductOptionDto {
  title: string;
  price: number;
}

export type BasketProductOptionUpdateDto = Partial<{ status: boolean } & BasketProductOptionDto>;
