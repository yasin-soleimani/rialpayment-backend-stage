export class CardManagementApiDto {
  mobile: number;
  user: string;
  readonly cardno: number;
  readonly cardowner: boolean;
  cardrelatione?: string;
  readonly cardownerfullname: string;
  readonly organ: boolean;
}
