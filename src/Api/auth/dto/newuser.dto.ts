export class NewUserAuthhDto {
  mobile: number;
  nationalcode: string;
  password: string;
  readonly devicetype: string;
  birthdate: number;
  profilestatus: number;
  active?: boolean;
  ref?: string;
  fullname?: string;
  place?: string;
  cardno?: number;
  group?: string;
}
