export class PspDto {
  readonly name: string;
  readonly terminalid: number;
  readonly username: string;
  readonly password: string;
  readonly status?: boolean;
  readonly description?: string;
  readonly type: number;
}
