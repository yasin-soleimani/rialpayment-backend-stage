export class PoolApiDto {
  readonly amount: number;
  readonly pool: string;
}

export class PoolAddNewApiDto {
  readonly id?: string;
  readonly charge?: boolean;
  readonly bill?: ConstrainBooleanParameters;
  readonly groups: [string];
  readonly title: string;
  readonly minremain: number;
}
