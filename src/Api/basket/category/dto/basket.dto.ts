export class BasketCategoryApiDto {
  id?: string;
  parent?: string;
  user: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  img: string;
  isHyperCat: boolean;
  slug: string;
}
