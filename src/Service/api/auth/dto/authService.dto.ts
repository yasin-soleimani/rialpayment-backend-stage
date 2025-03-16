export class AuthServiceDto {
  readonly mobile: number;
  readonly nationalcode: string;
  readonly password: string;
  readonly birthdate: number;
  profilestatus: number;
  fullname?: string;
  place?: string;
  active: boolean;
  ref: string;
}
