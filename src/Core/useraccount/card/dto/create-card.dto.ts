export class CreateCardDto {
  readonly user: string;
  readonly cardno: number;
  readonly pin?: string;
  readonly expire: string;
  readonly cvv2: number;
}
