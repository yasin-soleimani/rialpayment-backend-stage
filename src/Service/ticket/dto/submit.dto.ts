export class VoucherTicketSubmitServiceDto {
  mobile: string;
  acode: string;
  item: [TicketSubmitItem];
}

class TicketSubmitItem {
  id: string;
  qty: number;
}
