export class BackofficePoolAddNewDto {
  id: string;
  groups: [string];
  title: string;
  minremain: number;
  status: boolean;
  user: string;
}

export class BackofficePoolFilterDto {
  user: string;
  search: string;
}
