export class WageSystemCoreDto {
  total: number;
  type: number;
  wage: {
    total: number;
    company: number;
    agent: number;
    merchant: number;
    type: number;
    wagenumber: number;
  };
  merchantinfo: {
    acceptor: string;
    terminal: string;
    type: number;
  };
  agent: string;
  merchant: string;
  user: string;
  createdAt?: Date;
  updatedAt?: Date;
}
