export class VoucherDetailsCoreDto {
  voucher: string;
  item: [VoucherItemDto];
  total: number;
  qty: number;
}

class VoucherItemDto {
  product: string;
  qty: number;
  amount: number;
  discount: number;
  total: number;
}
