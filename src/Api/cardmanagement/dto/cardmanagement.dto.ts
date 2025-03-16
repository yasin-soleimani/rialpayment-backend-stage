export class CardmanagementDto {
  user: string;
  readonly cardno: number;
  readonly cardowner: boolean;
  readonly cardrelatione?: string;
  readonly cardownerfullname: string;
  readonly organ: boolean;
  pin?: string;
}
