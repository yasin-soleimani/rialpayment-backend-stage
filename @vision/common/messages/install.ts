export function installDetailsSuccessOpt(data) {
  return {
    status: 200,
    success: true,
    message: 'عملیات با موفقیت انجام شد',
    data: data,
  }
}