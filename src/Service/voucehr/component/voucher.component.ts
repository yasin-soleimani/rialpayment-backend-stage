export function voucherReturnSuccess(amount: number) {
  return {
    status: 0,
    success: true,
    message: 'عملیات با موفقیت انجام شد',
    amount: amount,
  };
}
