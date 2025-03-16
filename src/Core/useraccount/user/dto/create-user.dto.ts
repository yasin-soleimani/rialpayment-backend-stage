export class CreateUserDto {
  readonly mobile?: number;
  readonly nationalcode?: string;
  readonly password?: string;
  readonly profilestatus?: number;
  readonly birthdate?: number;
  ref?: string;
  active?: boolean;
}
