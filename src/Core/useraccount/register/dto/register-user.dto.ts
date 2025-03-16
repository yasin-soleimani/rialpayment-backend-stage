export class RegisterUserCoreDto {
  mobile: number;
  nationalcode: string;
  password: string;
  readonly devicetype: string;
  readonly birthdate: number;
  profilestatus: number;
  fullname?: string;
  place?: string;
  refid?: string;
  ref?: string;
}
